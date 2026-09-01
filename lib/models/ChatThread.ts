import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatThread extends Document {
  displayName: string;
  customerId?: mongoose.Types.ObjectId | null;
  guestId?: string | null;
  conversationKey: string;
  lastMessage?: string;
  lastMessageAt?: Date | null;
  unreadByAdmin: number;
  unreadByCustomer: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatThreadSchema = new Schema<IChatThread>(
  {
    displayName: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },
    conversationKey: { type: String, required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ChatThreadSchema.index({ customerId: 1 });
ChatThreadSchema.index({ guestId: 1 });
ChatThreadSchema.index({ lastMessageAt: -1 });
ChatThreadSchema.index({ conversationKey: 1 }, { unique: true });

const ChatThread: Model<IChatThread> =
  mongoose.models.ChatThread || mongoose.model<IChatThread>("ChatThread", ChatThreadSchema);

export default ChatThread;
