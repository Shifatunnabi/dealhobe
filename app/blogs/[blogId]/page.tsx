// ISR: blog content changes rarely — revalidate once per hour.
export const revalidate = 3600;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlog, getAllBlogIds } from "@/lib/data";

/** Pre-build one page per blog post at build time. */
export async function generateStaticParams() {
  const ids = await getAllBlogIds();
  return ids.map((blogId) => ({ blogId }));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;

  const blog = await getBlog(blogId);
  if (!blog) notFound();

  const publishedAt     = blog.publishedAt || blog.createdAt;
  const date            = new Date(publishedAt);
  const formattedDate   = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const formattedTime   = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-4xl px-section">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 rounded-full border border-primary-pink/30 bg-primary-pink/5 px-4 py-2 text-sm font-semibold text-primary-pink transition-colors hover:bg-primary-pink hover:text-white"
        >
          Back to Blogs
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-card">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={blog.imageUrl}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
              priority
            />
          </div>
          <div className="p-6 md:p-10">
            <h1 className="font-poppins text-3xl font-bold text-text-dark md:text-4xl">
              {blog.title}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {formattedDate}{formattedTime ? ` at ${formattedTime}` : ""}
            </p>
            <div
              className="prose prose-p:font-poppins prose-p:text-text-muted prose-h2:text-text-dark prose-h3:text-text-dark max-w-none mt-6"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
