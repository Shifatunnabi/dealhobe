import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title:       string;
  category:    string;
  content:     string;        // Tiptap HTML output
  imageUrl:    string;
  imagePublicId: string;
  isFeatured:  boolean;
  publishedAt: Date;
  createdAt:   Date;
  updatedAt:   Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title:         { type: String, required: true },
    category:      { type: String, required: true },
    content:       { type: String, required: true },
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    isFeatured:    { type: Boolean, default: false },
    publishedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
