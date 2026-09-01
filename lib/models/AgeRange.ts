import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgeRange extends Document {
  label: string;        // e.g. "0-2 years"
  minAge: number;
  maxAge: number;
  imageUrl: string;
  imagePublicId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgeRangeSchema = new Schema<IAgeRange>(
  {
    label:         { type: String, required: true },
    minAge:        { type: Number, required: true },
    maxAge:        { type: Number, required: true },
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AgeRange: Model<IAgeRange> =
  mongoose.models.AgeRange || mongoose.model<IAgeRange>('AgeRange', AgeRangeSchema);

export default AgeRange;
