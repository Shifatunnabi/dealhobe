import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  shortDescription: string;
  brand: string;
  ageRange: string;
  category: string;
  toysFor: string;
  whyLoveIt: string[];
  description: string;
  images: string[];
  imagePublicIds: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    quantity: { type: Number, required: true, default: 0 },
    shortDescription: { type: String, required: true },
    brand: { type: String, required: true }, // Store name or ID
    ageRange: { type: String, required: true }, // Store label or ID
    category: { type: String, required: true }, // Store name or ID
    toysFor: { type: String, enum: ['boys', 'girls', 'both'], required: true },
    whyLoveIt: [{ type: String }],
    description: { type: String, required: true }, // HTML
    images: [{ type: String }],
    imagePublicIds: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
