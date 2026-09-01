import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

const SETTINGS_KEY = "global";

export async function GET() {
  await connectDB();
  const settings = await Settings.findOne({ key: SETTINGS_KEY }).lean();

  return NextResponse.json(
    {
      logoUrl: settings?.logoUrl || "",
      freeDeliveryThreshold: settings?.freeDeliveryThreshold || 0,
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } },
  );
}
