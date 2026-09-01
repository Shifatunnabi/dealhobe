import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  slug: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  details: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  productSelection: 'all' | 'selected';
  selectedProducts: string[]; // Array of Product ObjectIds as strings
  isActive: boolean;
  endingDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountAmount: { type: Number, required: true },
    details: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    thumbnailPublicId: { type: String, required: true },
    productSelection: { type: String, enum: ['all', 'selected'], required: true },
    selectedProducts: [{ type: String }],
    isActive: { type: Boolean, default: true },
    endingDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
