import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  customerName: string;
  customerId:   string;
  customerEmail: string;
  rating:       number;
  review:       string;
  productId:    string;      // optional reference
  isApproved:   boolean;
  isFeatured:   boolean;     // shown on homepage
  createdAt:    Date;
  updatedAt:    Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, required: true },
    customerId:   { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating:       { type: Number, min: 1, max: 5, default: 5 },
    review:       { type: String, required: true },
    productId:    { type: String, default: '' },
    isApproved:   { type: Boolean, default: false },
    isFeatured:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
