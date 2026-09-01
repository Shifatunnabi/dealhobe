import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getBalance } from "@/lib/steadfast";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const balance = await getBalance();
  return NextResponse.json({ balance });
}
