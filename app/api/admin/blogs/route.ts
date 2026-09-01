import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { deleteImage } from '@/lib/cloudinary';

export async function GET() {
  await connectDB();
  const blogs = await Blog.find().sort({ publishedAt: -1 });
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const blog = await Blog.create(body);
  revalidateTag('blogs', {});
  revalidatePath('/blogs');
  return NextResponse.json(blog, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id, ...data } = await req.json();
  const updated = await Blog.findByIdAndUpdate(id, data, { new: true });
  revalidateTag('blogs', {});
  revalidatePath('/blogs');
  if (id) revalidatePath(`/blogs/${id}`);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await req.json();
  const blog   = await Blog.findByIdAndDelete(id);
  if (blog?.imagePublicId) await deleteImage(blog.imagePublicId);
  revalidateTag('blogs', {});
  revalidatePath('/blogs');
  revalidatePath('/blogs/[blogId]', 'page');
  return NextResponse.json({ success: true });
}
