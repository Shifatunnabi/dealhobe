import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { threadId } = await params;
  const body = await req.json();
  const text = String(body?.text || "").trim();

  if (!text) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }

  const thread = await ChatThread.findById(threadId);
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  const message = await ChatMessage.create({
    threadId: thread._id,
    sender: "admin",
    text,
    readByAdmin: true,
    readByCustomer: false,
  });

  thread.lastMessage = text;
  thread.lastMessageAt = new Date();
  thread.unreadByCustomer = (thread.unreadByCustomer || 0) + 1;
  await thread.save();

  return NextResponse.json({
    message: {
      id: message._id.toString(),
      sender: message.sender,
      text: message.text,
      createdAt: message.createdAt,
    },
  });
}
