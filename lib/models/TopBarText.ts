import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopBarText extends Document {
  text:      string;
  isActive:  boolean;
  order:     number;
  createdAt: Date;
  updatedAt: Date;
}

const TopBarTextSchema = new Schema<ITopBarText>(
  {
    text:     { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

const TopBarText: Model<ITopBarText> =
  mongoose.models.TopBarText ||
  mongoose.model<ITopBarText>('TopBarText', TopBarTextSchema);

export default TopBarText;
