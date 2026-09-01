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

export async function GET(req: NextRequest) {
  await connectDB();

  const customer = await getCustomerFromRequest(req);
  const guestId = req.nextUrl.searchParams.get("guestId") || "";

  let thread = null;
  if (customer) {
    thread = await ChatThread.findOne({ customerId: customer._id }).lean();
  } else if (guestId) {
    thread = await ChatThread.findOne({ guestId }).lean();
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!thread) {
    return NextResponse.json({ thread: null, messages: [] });
  }

  const messages = await ChatMessage.find({ threadId: thread._id, sender: { $ne: "system" } })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({
    thread: {
      id: thread._id.toString(),
      displayName: thread.displayName,
      guestId: thread.guestId || null,
      unreadByCustomer: thread.unreadByCustomer || 0,
    },
    messages: messages.map((msg) => ({
      id: msg._id.toString(),
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt,
    })),
  });
}
