import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { deleteImage } from "@/lib/cloudinary";

const SETTINGS_KEY = "global";

const normalizeRanges = (ranges: any) => {
  const raw = Array.isArray(ranges) ? ranges : [];
  const mapped = raw
    .map((range: any) => {
      const min = Number(range?.min);
      const points = Number(range?.points);
      const hasMax = range?.max !== null && range?.max !== undefined && range?.max !== "";
      const max = hasMax ? Number(range?.max) : null;
      if (!Number.isFinite(min) || !Number.isFinite(points)) return null;
      if (min < 0 || points < 0) return null;
      if (hasMax && (!Number.isFinite(max) || (max as number) < 0)) return null;
      if (hasMax && (max as number) < min) return null;
      return { min, max, points };
    })
    .filter(Boolean) as { min: number; max: number | null; points: number }[];

  return mapped.sort((a, b) => a.min - b.min);
};

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const settings = await Settings.findOne({ key: SETTINGS_KEY }).lean();

  return NextResponse.json({
    freeDeliveryThreshold: settings?.freeDeliveryThreshold || 0,
    loyaltyRanges: settings?.loyaltyRanges || [],
    logoUrl: settings?.logoUrl || "",
    logoPublicId: settings?.logoPublicId || "",
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const freeDeliveryThreshold = Number(body?.freeDeliveryThreshold) || 0;
  const loyaltyRanges = normalizeRanges(body?.loyaltyRanges);
  const logoUrl = typeof body?.logoUrl === "string" ? body.logoUrl : "";
  const logoPublicId = typeof body?.logoPublicId === "string" ? body.logoPublicId : "";

  const existing = await Settings.findOne({ key: SETTINGS_KEY });
  const prevLogoPublicId = existing?.logoPublicId || "";

  const updated = await Settings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $set: {
        freeDeliveryThreshold,
        loyaltyRanges,
        logoUrl,
        logoPublicId,
      },
    },
    { new: true, upsert: true },
  ).lean();

  if (prevLogoPublicId && logoPublicId && prevLogoPublicId !== logoPublicId) {
    await deleteImage(prevLogoPublicId);
  }

  revalidatePath('/');
  return NextResponse.json({
    freeDeliveryThreshold: updated?.freeDeliveryThreshold || 0,
    loyaltyRanges: updated?.loyaltyRanges || [],
    logoUrl: updated?.logoUrl || "",
    logoPublicId: updated?.logoPublicId || "",
  });
}
