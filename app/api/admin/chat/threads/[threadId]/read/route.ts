import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { threadId } = await params;
  const thread = await ChatThread.findById(threadId);
  if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

  await ChatMessage.updateMany(
    { threadId: thread._id, sender: "customer", readByAdmin: false },
    { $set: { readByAdmin: true } },
  );

  thread.unreadByAdmin = 0;
  await thread.save();

  return NextResponse.json({ ok: true });
}
