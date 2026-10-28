// ISR: blogs change rarely — revalidate once per hour.
export const revalidate = 3600;

import type { Metadata } from 'next';
import BlogsPageClient from './BlogsPageClient';
import { getBlogs } from '@/lib/data';
import { blogPlainText, excerptOf, readingTime, type BlogSummary } from '@/components/content/blog';

export const metadata: Metadata = {
  title: 'The Beauty Journal — Skincare & Makeup Guides',
  description:
    'Skincare routines, makeup tips, ingredient guides and honest reviews from the DealHobe team — beauty advice for Bangladesh.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    title: 'The Beauty Journal | DealHobe Bangladesh',
    description: 'Skincare routines, makeup tips, ingredient guides and honest reviews from the DealHobe team.',
    url: '/blogs',
    type: 'website',
  },
};

export default async function BlogsPage() {
  const blogs = await getBlogs();

  const mapped: BlogSummary[] = blogs.map((blog) => {
    const contentText = blogPlainText(blog.content);
    return {
      _id: blog._id,
      title: blog.title,
      category: blog.category,
      thumbnailUrl: blog.imageUrl,
      date: blog.publishedAt || blog.createdAt,
      readTime: readingTime(contentText),
      excerpt: excerptOf(contentText),
      author: 'DealHobe Team',
      isFeatured: blog.isFeatured,
    };
  });

  return <BlogsPageClient blogs={mapped} />;
}
