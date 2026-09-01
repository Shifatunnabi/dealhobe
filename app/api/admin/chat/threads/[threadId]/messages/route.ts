import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { threadId } = await params;

  if (!mongoose.isValidObjectId(threadId)) {
    return NextResponse.json({ error: "Invalid thread id." }, { status: 400 });
  }

  const threadObjectId = new mongoose.Types.ObjectId(threadId);

  const messages = await ChatMessage.find({ threadId: threadObjectId })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json(
    messages.map((msg) => ({
      id: msg._id.toString(),
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt,
    })),
  );
}
