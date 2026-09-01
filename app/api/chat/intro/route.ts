import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const text = String(body?.text || "").trim();
  const threadId = String(body?.threadId || "").trim();
  const guestId = String(body?.guestId || "").trim();

  if (!text || !threadId) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const thread = await ChatThread.findById(threadId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  if (guestId && thread.guestId !== guestId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await ChatMessage.create({
    threadId: thread._id,
    sender: "system",
    text,
    readByCustomer: true,
    readByAdmin: false,
  });

  thread.lastMessage = text;
  thread.lastMessageAt = new Date();
  thread.unreadByAdmin = (thread.unreadByAdmin || 0) + 1;
  await thread.save();

  return NextResponse.json({ ok: true });
}
