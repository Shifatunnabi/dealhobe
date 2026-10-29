// ISR: blog content changes rarely — revalidate once per hour.
export const revalidate = 3600;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { getBlog, getAllBlogIds, getBlogs } from "@/lib/data";
import { loadCatalog } from "@/lib/catalog-server";
import ProductCard from "@/components/sections/ProductCard";
import Breadcrumbs from "@/components/content/Breadcrumbs";
import { slimCard } from "@/components/content/slim";
import { blogPlainText, excerptOf, formatBlogDate, readingTime } from "@/components/content/blog";

type Props = { params: Promise<{ blogId: string }> };

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealhobe.com.bd").replace(/\/+$/, "");
const absolute = (url: string) => (url.startsWith("/") ? `${siteUrl()}${url}` : url);
const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

/** Pre-build one page per blog post at build time. */
export async function generateStaticParams() {
  const ids = await getAllBlogIds();
  return ids.map((blogId) => ({ blogId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId } = await params;
  const blog = await getBlog(blogId).catch(() => null);
  if (!blog) return { title: "Story not found", robots: { index: false } };
  const description = excerptOf(blogPlainText(blog.content), 158);
  const url = `/blogs/${blog._id}`;
  return {
    title: blog.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: blog.title,
      description,
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt,
      section: blog.category,
      authors: ["DealHobe Team"],
    },
    twitter: { card: "summary_large_image", title: blog.title, description },
  };
}

/** A handful of products that fit the story: matched by category name, else best sellers. */
async function productsFor(category: string, title: string) {
  try {
    const { items, facets } = await loadCatalog();
    const text = squash(`${category} ${title}`);
    const matched = facets.categories.filter((c) => squash(c.name) && text.includes(squash(c.name))).map((c) => c._id);
    const inStock = items.filter((p) => Number(p.quantity ?? 0) > 0);
    const pool = matched.length ? inStock.filter((p) => matched.includes(p.categoryId)) : inStock;
    return [...(pool.length >= 4 ? pool : inStock)].sort((a, b) => b.sold - a.sold || b.discountPct - a.discountPct).slice(0, 4).map(slimCard);
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { blogId } = await params;

  const blog = await getBlog(blogId);
  if (!blog) notFound();

  const [allBlogs, products] = await Promise.all([getBlogs().catch(() => []), productsFor(blog.category, blog.title)]);

  const text = blogPlainText(blog.content);
  const minutes = readingTime(text);
  const dek = excerptOf(text, 180);
  const publishedAt = blog.publishedAt || blog.createdAt;
  const dateLabel = formatBlogDate(publishedAt, "long");

  const others = allBlogs.filter((b) => b._id !== blog._id);
  const related = [...others.filter((b) => b.category === blog.category), ...others.filter((b) => b.category !== blog.category)].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: dek,
    image: blog.imageUrl ? [absolute(blog.imageUrl)] : undefined,
    datePublished: publishedAt,
    dateModified: blog.updatedAt || publishedAt,
    articleSection: blog.category,
    wordCount: text ? text.split(" ").length : 0,
    author: { "@type": "Organization", name: "DealHobe Team", url: siteUrl() },
    publisher: {
      "@type": "Organization",
      name: "DealHobe Bangladesh",
      logo: { "@type": "ImageObject", url: `${siteUrl()}/logo/main-logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl()}/blogs/${blog._id}` },
  };

  return (
    <div className="bg-soft-bg pb-24 pt-4 md:pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="shell">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journal", href: "/blogs" }, { label: blog.category || "Story" }]} />

        <article>
          {/* Header */}
          <header className="mx-auto mt-8 max-w-3xl text-center md:mt-12">
            <Link href="/blogs" className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-pink hover:underline">
              {blog.category || "The Journal"}
            </Link>
            <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.1] text-text-dark text-balance md:text-[3.25rem]">
              {blog.title}
            </h1>
            <div className="mt-7 flex items-center justify-center gap-3 text-sm text-text-muted">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum font-display text-sm font-semibold text-[#F2D9A6]" aria-hidden>
                DH
              </span>
              <span className="text-left leading-tight">
                <span className="block font-semibold text-text-dark">DealHobe Team</span>
                <span className="text-xs">
                  {dateLabel && <time dateTime={publishedAt}>{dateLabel}</time>}
                  {dateLabel && " · "}
                  {minutes} min read
                </span>
              </span>
            </div>
          </header>

          {/* Hero image */}
          {blog.imageUrl && (
            <div className="relative mx-auto mt-8 aspect-[16/9] max-w-5xl overflow-hidden rounded-[22px] bg-ivory shadow-card md:mt-10">
              <Image src={blog.imageUrl} alt={blog.title} fill priority className="object-cover" sizes="(max-width: 1100px) 100vw, 1024px" />
            </div>
          )}

          {/* Body */}
          <div className="mt-10 grid gap-10 md:mt-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,68ch)_minmax(0,1fr)]">
            <div className="hidden xl:block">
              <Link href="/blogs" className="sticky top-44 inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary-pink">
                <FiArrowLeft aria-hidden /> All stories
              </Link>
            </div>

            <div
              className="mx-auto w-full max-w-[68ch] text-[17px] leading-[1.8] text-[#3A2A35] md:text-[18px]
                [&>*:first-child]:mt-0 [&_p]:my-5
                [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-2.5 [&>p:first-of-type]:first-letter:mt-1.5 [&>p:first-of-type]:first-letter:font-display [&>p:first-of-type]:first-letter:text-[3.6em] [&>p:first-of-type]:first-letter:font-semibold [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-primary-pink
                [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-[1.6rem] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-text-dark md:[&_h2]:text-[1.85rem]
                [&_h3]:mb-2 [&_h3]:mt-9 [&_h3]:text-[1.2rem] [&_h3]:font-bold [&_h3]:text-text-dark
                [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li]:pl-1 [&_li]:marker:text-primary-pink
                [&_a]:font-semibold [&_a]:text-primary-pink [&_a]:underline [&_a]:decoration-primary-pink/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-primary-pink
                [&_blockquote]:my-8 [&_blockquote]:border-l-[3px] [&_blockquote]:border-gold [&_blockquote]:pl-6 [&_blockquote]:font-display [&_blockquote]:text-[1.3rem] [&_blockquote]:italic [&_blockquote]:leading-snug [&_blockquote]:text-text-dark
                [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_strong]:font-bold [&_strong]:text-text-dark [&_hr]:my-12 [&_hr]:border-[#EADDE3]
                [&_table]:my-6 [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:border-[#EFE3E8] [&_td]:py-2 [&_th]:border-b [&_th]:border-[#EADDE3] [&_th]:py-2 [&_th]:text-left"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <aside className="hidden xl:block" aria-label="Shop DealHobe">
              <div className="sticky top-44 rounded-2xl border border-[#F1E7EB] bg-white p-5 shadow-tile">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-dark">Read it, then try it</p>
                <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-text-dark">100% authentic beauty, cash on delivery.</p>
                <Link href="/products" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary-pink py-2.5 text-sm font-bold text-white shadow-button hover:bg-[#8E1712]">
                  Shop now <FiArrowRight aria-hidden />
                </Link>
                <Link href="/offers" className="mt-2 block text-center text-xs font-bold text-plum hover:underline">See today’s offers</Link>
              </div>
            </aside>
          </div>
        </article>

        {/* Shop the products */}
        <section aria-labelledby="shop-title" className="mt-16 rounded-[26px] bg-ivory px-4 py-8 md:mt-20 md:px-8 md:py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dark">Shop the story</p>
              <h2 id="shop-title" className="section-title mt-1">Shop the products</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-pink hover:underline">
              Shop all <FiArrowRight aria-hidden />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-primary-pink px-6 py-3 text-sm font-bold text-white shadow-button">
              Browse the collection <FiArrowRight aria-hidden />
            </Link>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-16 md:mt-20">
            <div className="mb-6 flex items-end justify-between gap-3 border-t border-[#EADDE3] pt-8">
              <h2 id="related-title" className="section-title">Keep reading</h2>
              <Link href="/blogs" className="text-sm font-bold text-primary-pink hover:underline">All stories</Link>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {related.map((post) => {
                const t = blogPlainText(post.content);
                return (
                  <article key={post._id} className="group">
                    <Link href={`/blogs/${post._id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ivory shadow-tile">
                        {post.imageUrl && (
                          <Image src={post.imageUrl} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px" />
                        )}
                      </div>
                      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-dark">{post.category}</p>
                      <h3 className="mt-1.5 line-clamp-2 font-display text-xl font-semibold leading-snug text-text-dark group-hover:text-primary-pink">{post.title}</h3>
                      <p className="mt-2 text-xs text-text-muted">{readingTime(t)} min read</p>
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
