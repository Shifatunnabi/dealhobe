import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import connectDB from "@/lib/mongodb";
import ChatThread from "@/lib/models/ChatThread";
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

  const customer = await getCustomerFromRequest(req);
  if (customer) {
    let thread = await ChatThread.findOne({ customerId: customer._id });
    if (!thread) {
      thread = await ChatThread.create({
        displayName: customer.fullName,
        customerId: customer._id,
        conversationKey: `customer:${customer._id.toString()}`,
        lastMessageAt: new Date(),
      });
    } else if (!thread.conversationKey) {
      thread.conversationKey = `customer:${customer._id.toString()}`;
      await thread.save();
    }

    return NextResponse.json({
      threadId: thread._id.toString(),
      displayName: thread.displayName,
      guestId: null,
      isGuest: false,
    });
  }

  const displayName = String(body?.displayName || "").trim();
  let guestId = String(body?.guestId || "").trim();

  if (!displayName) {
    return NextResponse.json({ error: "Missing display name." }, { status: 400 });
  }

  if (!guestId) {
    guestId = randomUUID();
  }

  let thread = await ChatThread.findOne({ guestId });
  if (!thread) {
    thread = await ChatThread.create({
      displayName,
      guestId,
      conversationKey: `guest:${guestId}`,
      lastMessageAt: new Date(),
    });
  } else if (thread.displayName !== displayName) {
    thread.displayName = displayName;
    if (!thread.conversationKey) {
      thread.conversationKey = `guest:${guestId}`;
    }
    await thread.save();
  } else if (!thread.conversationKey) {
    thread.conversationKey = `guest:${guestId}`;
    await thread.save();
  }

  return NextResponse.json({
    threadId: thread._id.toString(),
    displayName: thread.displayName,
    guestId,
    isGuest: true,
  });
}
