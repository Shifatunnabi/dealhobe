"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiBookOpen, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { formatBlogDate, type BlogSummary } from "@/components/content/blog";
import ScrollRow from "@/components/ui/ScrollRow";

const PER_PAGE = 9;

function Meta({ post, className }: { post: BlogSummary; className?: string }) {
  const date = formatBlogDate(post.date);
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-xs text-text-muted", className)}>
      {date && <time dateTime={post.date}>{date}</time>}
      {date && <span aria-hidden className="h-1 w-1 rounded-full bg-[#D8C8CF]" />}
      <span>{post.readTime} min read</span>
    </p>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-dark">{children}</span>;
}

/* ─── Cards ──────────────────────────────────────────────────── */
function BlogCard({ post }: { post: BlogSummary }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/blogs/${post._id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ivory shadow-tile">
          {post.thumbnailUrl && (
            <Image
              src={post.thumbnailUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <Eyebrow>{post.category}</Eyebrow>
          <h3 className="mt-1.5 line-clamp-2 font-display text-xl font-semibold leading-snug text-text-dark transition-colors group-hover:text-primary-pink">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">{post.excerpt}</p>
          <Meta post={post} className="mt-auto pt-3" />
        </div>
      </Link>
    </article>
  );
}

function SidePick({ post }: { post: BlogSummary }) {
  return (
    <Link href={`/blogs/${post._id}`} className="group flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory md:h-24 md:w-28">
        {post.thumbnailUrl && (
          <Image src={post.thumbnailUrl} alt="" fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="min-w-0">
        <Eyebrow>{post.category}</Eyebrow>
        <h3 className="mt-1 line-clamp-2 font-display text-[1.05rem] font-semibold leading-snug text-text-dark group-hover:text-primary-pink">{post.title}</h3>
        <Meta post={post} className="mt-1.5" />
      </div>
    </Link>
  );
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  const btn = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => onChange(current - 1)} disabled={current === 1} aria-label="Previous page"
        className={cn(btn, "border border-[#EBDDE3] bg-white text-text-dark hover:border-primary-pink disabled:opacity-40")}>
        <FiChevronLeft />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-text-muted">…</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === current ? "page" : undefined}
            className={cn(btn, p === current ? "bg-plum text-white" : "border border-[#EBDDE3] bg-white text-text-dark hover:border-primary-pink")}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(current + 1)} disabled={current === total} aria-label="Next page"
        className={cn(btn, "border border-[#EBDDE3] bg-white text-text-dark hover:border-primary-pink disabled:opacity-40")}>
        <FiChevronRight />
      </button>
    </nav>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function BlogsPageClient({ blogs = [] }: { blogs?: BlogSummary[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => ["All", ...Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)))], [blogs]);
  const featured = blogs.find((p) => p.isFeatured) || blogs[0];
  const sidePicks = useMemo(() => blogs.filter((p) => p._id !== featured?._id).slice(0, 3), [blogs, featured?._id]);

  const filtered = useMemo(() => {
    const rest = blogs.filter((p) => p._id !== featured?._id);
    if (activeCategory !== "All") return rest.filter((p) => p.category === activeCategory);
    const picked = new Set(sidePicks.map((p) => p._id));
    return rest.filter((p) => !picked.has(p._id));
  }, [activeCategory, blogs, featured?._id, sidePicks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    document.getElementById("all-stories")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-soft-bg pb-24 pt-4 md:pt-6">
      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal" }]} />

        {/* Masthead */}
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#EADDE3] pb-6 md:mt-8 md:pb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-pink">The DealHobe Journal</p>
            <h1 className="mt-2 font-display text-[2.3rem] font-semibold leading-[1.05] text-text-dark md:text-[3.6rem]">
              Beauty, <em className="italic text-primary-pink">explained.</em>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-text-muted md:text-[15px]">
            Routines, ingredient guides and honest reviews from our team — so every product you pick works harder for you.
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <FiBookOpen size={44} className="text-primary-pink/40" aria-hidden />
            <p className="font-display text-2xl font-semibold text-text-dark">Fresh stories are coming soon</p>
            <Link href="/products" className="rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button">Shop the collection</Link>
          </div>
        ) : (
          <>
            {/* Lead story + side picks */}
            {featured && (
              <section aria-label="Featured stories" className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-12">
                <article className="group">
                  <Link href={`/blogs/${featured._id}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-ivory shadow-card">
                      {featured.thumbnailUrl && (
                        <Image
                          src={featured.thumbnailUrl}
                          alt=""
                          fill
                          priority
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 100vw, 800px"
                        />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-plum">
                        Featured
                      </span>
                    </div>
                    <div className="mt-5">
                      <Eyebrow>{featured.category}</Eyebrow>
                      <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-[1.12] text-text-dark transition-colors group-hover:text-primary-pink md:text-[2.4rem]">
                        {featured.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 max-w-[62ch] text-[15px] leading-relaxed text-text-muted">{featured.excerpt}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Meta post={featured} />
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-pink">
                          Read the story <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>

                {sidePicks.length > 0 && (
                  <aside aria-label="Also worth reading" className="lg:border-l lg:border-[#EADDE3] lg:pl-10">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">Also worth reading</p>
                    <div className="divide-y divide-[#EFE3E8]">
                      {sidePicks.map((p) => <SidePick key={p._id} post={p} />)}
                    </div>
                    <Link
                      href="/products"
                      className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-plum px-5 py-4 text-white transition-opacity hover:opacity-95"
                    >
                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Read it, then try it</span>
                        <span className="mt-0.5 block font-display text-lg font-semibold">Shop the products</span>
                      </span>
                      <FiArrowRight aria-hidden />
                    </Link>
                  </aside>
                )}
              </section>
            )}

            {/* All stories */}
            <section id="all-stories" aria-labelledby="all-stories-title" className="mt-14 scroll-mt-40 md:mt-20">
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EADDE3] pt-8">
                <h2 id="all-stories-title" className="section-title">Latest stories</h2>
                {categories.length > 2 && (
                  <ScrollRow label="topics" arrowSize="sm" className="-mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-auto" trackClassName="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0" role="group" trackLabel="Filter by topic">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategory(cat)}
                        aria-pressed={activeCategory === cat}
                        className={cn(
                          "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          activeCategory === cat ? "bg-plum text-white" : "border border-[#EBDDE3] bg-white text-text-dark hover:border-primary-pink/50",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </ScrollRow>
                )}
              </div>

              {paginated.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-text-muted">
                    {activeCategory === "All" ? "That’s every story for now — more coming soon." : "No more stories in this topic yet."}
                  </p>
                  {activeCategory !== "All" && (
                    <button type="button" onClick={() => handleCategory("All")} className="text-sm font-bold text-primary-pink hover:underline">
                      View all stories
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {paginated.map((post) => <BlogCard key={post._id} post={post} />)}
                </div>
              )}

              {totalPages > 1 && <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />}
            </section>

            {/* Shop CTA */}
            <section className="relative mt-16 overflow-hidden rounded-[26px] bg-ivory px-6 py-10 text-center md:mt-20 md:py-14">
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blush/70 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">100% authentic · Cash on delivery</p>
                <h2 className="mx-auto mt-3 max-w-xl font-display text-[1.8rem] font-semibold leading-tight text-text-dark md:text-[2.4rem]">
                  Found your next favourite? Shop the products.
                </h2>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button hover:bg-[#8E1712]">
                    Shop all products <FiArrowRight aria-hidden />
                  </Link>
                  <Link href="/offers" className="inline-flex items-center gap-2 rounded-full border border-plum/20 bg-white px-6 py-3 text-sm font-bold text-plum hover:border-plum">
                    See today’s offers
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
