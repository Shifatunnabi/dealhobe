import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name:          string;
  imageUrl:      string;
  imagePublicId: string;
  order:         number;
  isHidden?:     boolean; // hidden from the storefront (menus, homepage, filters)
  createdAt:     Date;
  updatedAt:     Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:          { type: String, required: true },
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order:         { type: Number, default: 0 },
    isHidden:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
