import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl:      string;
  imagePublicId: string;
  title:         string;
  subtitle:      string;
  ctaText:       string;
  ctaLink:       string;
  order:         number;
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    title:         { type: String, default: '' },
    subtitle:      { type: String, default: '' },
    ctaText:       { type: String, default: 'Shop Now' },
    ctaLink:       { type: String, default: '/products' },
    order:         { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

export default HeroSlide;
