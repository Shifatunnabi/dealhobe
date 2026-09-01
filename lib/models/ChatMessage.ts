import mongoose, { Schema, Document, Model } from "mongoose";

export type ChatSender = "customer" | "admin" | "system";

export interface IChatMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  sender: ChatSender;
  text: string;
  readByAdmin: boolean;
  readByCustomer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "ChatThread", required: true },
    sender: { type: String, enum: ["customer", "admin", "system"], required: true },
    text: { type: String, required: true },
    readByAdmin: { type: Boolean, default: false },
    readByCustomer: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ChatMessageSchema.index({ threadId: 1, createdAt: 1 });

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
