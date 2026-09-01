import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  name:          string;
  logoUrl:       string;
  logoPublicId:  string;
  order:         number;
  createdAt:     Date;
  updatedAt:     Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name:         { type: String, required: true },
    logoUrl:      { type: String, required: true },
    logoPublicId: { type: String, required: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Brand: Model<IBrand> =
  mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
