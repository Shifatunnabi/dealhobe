# Homepage scroll checks

Run against a production build with populated local data. Development compilation changes frame timings, so do not use `next dev` for performance measurements.

```powershell
npm run build
$env:PORT = '3100'
npm run start
```

In another terminal:

```powershell
npx playwright install chromium
npm run test:scroll
```

The suite uses desktop Chromium, mobile Chromium with touch input, and mobile with reduced motion. It delays image responses, scrolls from top to bottom, checks for unexpected upward jumps, verifies server-rendered carousel sizing before hydration, swipes vertically over the hero, and exercises category navigation and product tabs.

Each scroll run attaches frame timings, long tasks, and layout shifts to the HTML report in `playwright-report`. The limits are a 95th-percentile frame interval below 50 ms, no frame interval of 250 ms or longer, and layout shift below 0.1. These are regression limits for the local test environment; they do not guarantee the same timing on every device or network.

Set `PLAYWRIGHT_BASE_URL` to test another local port. An existing Chromium installation can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
