import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParentingTip extends Document {
  title:         string;
  details:       string;
  imageUrl:      string;
  imagePublicId: string;
  order:         number;
  createdAt:     Date;
  updatedAt:     Date;
}

const ParentingTipSchema = new Schema<IParentingTip>(
  {
    title:         { type: String, required: true },
    details:       { type: String, required: true },
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ParentingTip: Model<IParentingTip> =
  mongoose.models.ParentingTip ||
  mongoose.model<IParentingTip>('ParentingTip', ParentingTipSchema);

export default ParentingTip;
