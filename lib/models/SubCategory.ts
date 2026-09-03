import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory extends Document {
  name:      string;
  category:  string; // parent Category _id
  order:     number;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name:     { type: String, required: true },
    category: { type: String, required: true },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SubCategory: Model<ISubCategory> =
  mongoose.models.SubCategory || mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);

export default SubCategory;
