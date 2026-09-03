"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiChevronLeft, FiClock, FiUser, FiBookOpen } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, scaleIn } from "@/components/animations/variants";
import { ColorfulTitle } from "@/components/ui";

/* ─── Blog Data ──────────────────────────────────────────────── */


const PER_PAGE = 9;

/* ─── Category pill ──────────────────────────────────────────── */
function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 font-poppins text-sm font-semibold transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-gradient-primary text-white shadow-button"
          : "border border-gray-200 bg-white text-text-muted hover:border-primary-pink/50 hover:text-primary-pink",
      )}
    >
      {label}
    </button>
  );
}

/* ─── Blog Card ──────────────────────────────────────────────── */
function BlogCard({ post, index }: { post: any; index: number }) {
  return (
    <motion.article
      variants={scaleIn}
      custom={index}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-shadow duration-300 hover:shadow-hover"
    >
      <Link href={`/blogs/${post._id}`} className="block h-full">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-poppins text-xs font-semibold text-primary-pink shadow-soft backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-text-muted font-poppins">
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <FiClock size={11} />
              {post.readTime} min read
            </span>
          </div>

          {/* Title */}
          <h3 className="font-poppins text-lg font-semibold leading-snug text-text-dark line-clamp-2 transition-colors group-hover:text-primary-pink">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="font-poppins text-sm text-text-muted line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-white shrink-0">
              <FiUser size={12} />
            </div>
            <span className="font-poppins text-xs font-semibold text-text-dark">{post.author}</span>
          </div>

          <div className="mt-auto pt-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-pink/30 bg-primary-pink/5 px-4 py-2 text-sm font-semibold text-primary-pink transition-colors group-hover:bg-primary-pink group-hover:text-white">
              Read Article
              <FiChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  const btn = "flex h-9 w-9 items-center justify-center rounded-full text-sm font-poppins font-semibold transition-all";

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={cn(btn, "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40")}
      >
        <FiChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-text-muted">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(btn, p === current
              ? "bg-primary-pink text-white shadow-button"
              : "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={cn(btn, "border border-gray-200 bg-white text-text-dark shadow-soft hover:border-primary-pink hover:text-primary-pink disabled:cursor-not-allowed disabled:opacity-40")}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function BlogsPageClient({ blogs = [] }: { blogs?: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage]       = useState(1);

  const categories = ["All", ...Array.from(new Set(blogs.map(b => b.category)))];
  const featured = blogs.find((p) => p.isFeatured) || blogs[0];

  const filtered = useMemo(() =>
    activeCategory === "All"
      ? blogs.filter((p) => p._id !== featured?._id)
      : blogs.filter((p) => p._id !== featured?._id && p.category === activeCategory),
    [activeCategory, blogs, featured?._id],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-soft-bg pt-26 pb-24">
      <div className="mx-auto max-w-6xl px-section">

        {/* ── Page header ────────────────────────────────────── */}
        <motion.div
          className="mb-10 pt-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <nav className="mb-5 flex items-center justify-center gap-2 text-small text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary-pink">Home</Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">Blogs</span>
          </nav>
          <ColorfulTitle title="Beauty & Skincare Journal" as="h1" className="text-primary-pink" />
          <p className="mt-2 font-poppins text-sm text-text-muted max-w-md mx-auto">
            Tips, guides, and honest reviews to help you get the most out of your beauty routine.
          </p>
        </motion.div>

        {/* ── Featured post ───────────────────────────────────── */}
        {featured && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-12"
          >
            <Link href={`/blogs/${featured._id}`} className="group block">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-card transition-shadow duration-300 hover:shadow-hover">
                <div className="flex flex-col md:flex-row md:items-stretch">
                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden md:h-auto md:w-[45%] shrink-0">
                    <Image
                      src={featured.thumbnailUrl}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 45vw"
                      priority
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center gap-4 p-7 md:p-10">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gradient-primary px-3 py-1 font-poppins text-xs font-semibold text-white shadow-button">
                        Featured Story
                      </span>
                      <span className="rounded-full border border-gray-200 bg-soft-bg px-3 py-1 font-poppins text-xs text-text-muted">
                        {featured.readTime} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-poppins text-2xl font-bold leading-tight text-text-dark transition-colors group-hover:text-primary-pink md:text-3xl">
                      {featured.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="font-poppins text-sm leading-relaxed text-text-muted line-clamp-3">
                      {featured.excerpt}
                    </p>

                    {/* Author + date */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-white shrink-0">
                        <FiUser size={13} />
                      </div>
                      <div>
                        <p className="font-poppins text-sm font-semibold text-text-dark">{featured.author}</p>
                        <p className="font-poppins text-xs text-text-muted">{new Date(featured.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <span className="inline-flex w-fit items-center gap-1.5 font-poppins text-sm font-semibold text-primary-pink">
                      Read Article
                      <FiChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Category pills ──────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => handleCategory(cat)}
            />
          ))}
        </motion.div>

        {/* ── Blog grid ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {paginated.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-24 text-center"
            >
              <FiBookOpen size={56} className="text-primary-pink/40" />
              <p className="font-poppins text-xl text-text-muted">No articles in this category yet.</p>
              <button
                onClick={() => handleCategory("All")}
                className="rounded-2xl bg-gradient-primary px-6 py-3 font-poppins font-semibold text-white shadow-button hover:shadow-hover"
              >
                View All Articles
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${currentPage}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {paginated.map((post, i) => (
                <BlogCard key={post._id} post={post} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalPages > 1 && (
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={handlePageChange}
          />
        )}

      </div>
    </div>
  );
}
