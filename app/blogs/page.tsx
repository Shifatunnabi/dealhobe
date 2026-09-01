// ISR: blogs change rarely — revalidate once per hour.
export const revalidate = 3600;

import BlogsPageClient from './BlogsPageClient';
import { getBlogs } from '@/lib/data';

export default async function BlogsPage() {
  const blogs = await getBlogs();

  const mapped = blogs.map((blog) => {
    const contentText = String(blog.content || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = contentText ? contentText.split(' ').length : 0;
    const readTime  = Math.max(1, Math.ceil(wordCount / 200));
    const excerpt   = contentText.slice(0, 160);

    return {
      _id:         blog._id,
      title:       blog.title,
      category:    blog.category,
      thumbnailUrl: blog.imageUrl,
      date:        blog.publishedAt || blog.createdAt,
      readTime,
      excerpt,
      author:      'JoyToy Team',
      isFeatured:  blog.isFeatured,
    };
  });

  return <BlogsPageClient blogs={mapped} />;
}
