import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body    = await req.json();
    const { data, folder } = body as { data: string; folder?: string };

    if (!data) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    const result = await uploadImage(data, folder || 'joytoy');
    return NextResponse.json(result);
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
