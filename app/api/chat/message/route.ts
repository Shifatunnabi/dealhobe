import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";
import ChatMessage from "@/lib/models/ChatMessage";
import User from "@/lib/models/User";
import { verifyCustomerToken } from "@/lib/auth";

async function getCustomerFromRequest(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const payload = verifyCustomerToken(token);
    if (!payload?.userId) return null;
    const user = await User.findById(payload.userId).lean();
    return user || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const text = String(body?.text || "").trim();
  const threadId = String(body?.threadId || "").trim();
  const guestId = String(body?.guestId || "").trim();

  if (!text || !threadId) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }

  const customer = await getCustomerFromRequest(req);
  const thread = await ChatThread.findById(threadId);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found." }, { status: 404 });
  }

  if (customer) {
    if (!thread.customerId || thread.customerId.toString() !== customer._id.toString()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    if (!guestId || thread.guestId !== guestId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const message = await ChatMessage.create({
    threadId: thread._id,
    sender: "customer",
    text,
    readByCustomer: true,
    readByAdmin: false,
  });

  thread.lastMessage = text;
  thread.lastMessageAt = new Date();
  thread.unreadByAdmin = (thread.unreadByAdmin || 0) + 1;
  thread.unreadByCustomer = 0;
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
