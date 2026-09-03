import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  shortDescription: string;
  brand?: string;
  category: string;
  subCategory?: string;
  whyLoveIt: string[];
  description: string;
  images: string[];
  imagePublicIds: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isTopSeller: boolean;
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
    brand: { type: String }, // Store name or ID — optional
    category: { type: String, required: true }, // Store name or ID
    subCategory: { type: String }, // Store name or ID — optional, scoped under category
    whyLoveIt: [{ type: String }],
    description: { type: String, required: true }, // HTML
    images: [{ type: String }],
    imagePublicIds: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTopSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Search-supporting indexes: category/subCategory/brand are queried via
// $in id-lists resolved from taxonomy name matches (see /api/products/search).
ProductSchema.index({ category: 1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ brand: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
