import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const threads = await ChatThread.find()
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  return NextResponse.json(
    threads.map((thread) => ({
      id: thread._id.toString(),
      displayName: thread.displayName,
      lastMessage: thread.lastMessage || "",
      lastMessageAt: thread.lastMessageAt || thread.updatedAt,
      unreadByAdmin: thread.unreadByAdmin || 0,
      isGuest: Boolean(thread.guestId),
    })),
  );
}
