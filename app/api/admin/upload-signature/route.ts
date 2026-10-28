import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { cloudinary } from '@/lib/cloudinary';

/**
 * Signs a direct browser → Cloudinary upload. Animated GIFs and MP4 banners are often several MB, which is
 * too large to send base64 through /api/upload (serverless body limits), so the file goes straight to Cloudinary.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
  }

  const { folder } = await req.json().catch(() => ({}));
  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder: typeof folder === 'string' && /^[\w/-]{1,60}$/.test(folder) ? folder : 'dealhobe/homepage',
  };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);
  return NextResponse.json({ ...params, signature, apiKey, cloudName });
}
