import { test, expect } from "@playwright/test";

test.beforeAll(async ({ browser }) => {
  // Initialize Chromium's renderer without loading or caching any app resources.
  // A blank-page control also stalls during browser startup on some machines.
  const page = await browser.newPage();
  await page.setContent("<div style='height:2000px'>Renderer warmup</div>");
  await page.evaluate(() => new Promise<void>((resolve) => {
    let frames = 0;
    const frame = () => ++frames === 6 ? resolve() : requestAnimationFrame(frame);
    requestAnimationFrame(frame);
  }));
  await page.close();
});

test("cold-load scrolling stays responsive while images load", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Exercise loading without waiting for images or network-idle before scrolling.
  await page.route(/\.(png|jpe?g|webp)(\?.*)?$|\/_next\/image\?/i, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".z-9999")).toHaveCount(0);
  expect(await page.locator("#trending-products article").count()).toBeGreaterThan(0);

  await page.evaluate(() => {
    const metrics = { frames: [] as number[], longTasks: [] as number[], shifts: [] as number[], running: true };
    Object.assign(window, { scrollMetrics: metrics });
    new PerformanceObserver((list) => {
      if (metrics.running) metrics.longTasks.push(...list.getEntries().map((entry) => entry.duration));
    }).observe({ type: "longtask" });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (metrics.running && !shift.hadRecentInput) metrics.shifts.push(shift.value);
      }
    }).observe({ type: "layout-shift" });
    let previous = performance.now();
    const frame = (time: number) => {
      metrics.frames.push(time - previous);
      previous = time;
      if (metrics.running) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  let previousY = 0;
  for (let step = 0; step < 36; step++) {
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(80);
    const y = await page.evaluate(() => scrollY);
    // No delayed hydration reset or reveal should pull the user back up.
    expect(y).toBeGreaterThanOrEqual(previousY - 2);
    previousY = y;
  }
  const metrics = await page.evaluate(() => {
    const metrics = (window as unknown as { scrollMetrics: { frames: number[]; longTasks: number[]; shifts: number[]; running: boolean } }).scrollMetrics;
    metrics.running = false;
    const frames = metrics.frames.slice(2).sort((a, b) => a - b);
    return {
      p95FrameMs: frames[Math.floor(frames.length * 0.95)],
      maxFrameMs: Math.max(...frames),
      framesOver50Ms: frames.filter((frame) => frame > 50).length,
      longTasks: metrics.longTasks.length,
      maxLongTaskMs: Math.max(0, ...metrics.longTasks),
      layoutShift: metrics.shifts.reduce((sum, value) => sum + value, 0),
      reachedBottom: scrollY + innerHeight >= document.documentElement.scrollHeight - 3,
    };
  });
  console.log(`${testInfo.project.name} scroll metrics: ${JSON.stringify(metrics)}`);
  await testInfo.attach("scroll-metrics", { body: JSON.stringify(metrics, null, 2), contentType: "application/json" });
  expect(metrics.reachedBottom).toBe(true);
  expect(metrics.p95FrameMs).toBeLessThan(50);
  expect(metrics.maxFrameMs).toBeLessThan(250);
  expect(metrics.layoutShift).toBeLessThan(0.1);
  expect(errors).toEqual([]);
  // Do not accept a fast test that only scrolled past broken image placeholders.
  await expect.poll(() => page.locator("#trending-products img").first().evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("homepage-bottom.png") });
});

test("sections and mobile carousel sizing work before hydration", async ({ browser, baseURL }, testInfo) => {
  const mobile = testInfo.project.name !== "desktop";
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const page = await context.newPage();
  // Allow React's inline streaming bootstrap, but block application hydration.
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto(baseURL!, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".z-9999")).toHaveCount(0);
  const card = page.locator("#trending-products article").first();
  await expect(card).toBeVisible();
  await expect(card).toHaveCSS("opacity", "1");
  const ratio = await page.locator("#top-categories .basis-1\\/2").first().evaluate((card) => card.getBoundingClientRect().width / card.parentElement!.getBoundingClientRect().width);
  expect(ratio).toBeCloseTo(mobile ? 0.5 : 0.25, 2);
  await context.close();
});

test("mobile vertical swipes work over the draggable hero", async ({ page, context, isMobile }) => {
  test.skip(!isMobile, "Touch input is covered by the mobile projects.");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.locator(".homepage > section").first();
  await expect(hero.locator('[style*="touch-action"]')).toHaveCSS("touch-action", "pan-y");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 400 }] });
  for (let y = 380; y >= 120; y -= 20) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(150);
});

test("category navigation and product tabs remain usable", async ({ page, isMobile }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const reduced = testInfo.project.name === "reduced-motion";
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", reduced ? "auto" : "smooth");
  if (isMobile) {
    await page.getByRole("button", { name: "Categories", exact: true }).click();
    await expect.poll(() => page.locator("#top-categories").evaluate((section) => Math.round(section.getBoundingClientRect().top))).toBe(112);
  }
  const next = page.getByRole("button", { name: "Show next categories" });
  await next.click();
  await expect(page.getByRole("button", { name: "Show previous categories" })).toBeEnabled();
  await page.locator("#for-you").getByRole("button", { name: "Featured", exact: true }).click();
  const cards = page.locator("#for-you article");
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first()).toHaveCSS("opacity", "1");
  await expect(cards.first()).toHaveCSS("transform", "none");
});

test("leaving the homepage does not start a delayed splash screen", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("#trending-products article a").first().click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.locator(".z-9999")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
