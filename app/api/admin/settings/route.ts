import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { deleteImage } from "@/lib/cloudinary";

const SETTINGS_KEY = "global";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const settings = await Settings.findOne({ key: SETTINGS_KEY }).lean();

  return NextResponse.json({
    freeDeliveryThreshold: settings?.freeDeliveryThreshold || 0,
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
  const logoUrl = typeof body?.logoUrl === "string" ? body.logoUrl : "";
  const logoPublicId = typeof body?.logoPublicId === "string" ? body.logoPublicId : "";

  const existing = await Settings.findOne({ key: SETTINGS_KEY });
  const prevLogoPublicId = existing?.logoPublicId || "";

  const updated = await Settings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $set: {
        freeDeliveryThreshold,
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
    logoUrl: updated?.logoUrl || "",
    logoPublicId: updated?.logoPublicId || "",
  });
}
