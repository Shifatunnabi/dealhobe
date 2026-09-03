import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl:      string;
  imagePublicId: string;
  ctaText:       string;
  ctaLink:       string;
  ctaColor:      string;
  ctaTextColor:  string;
  order:         number;
  isActive:      boolean;
  createdAt:     Date;
  updatedAt:     Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    imageUrl:      { type: String, required: true },
    imagePublicId: { type: String, required: true },
    ctaText:       { type: String, default: 'Shop Now' },
    ctaLink:       { type: String, default: '/products' },
    ctaColor:      { type: String, default: '#A41B15' },
    ctaTextColor:  { type: String, default: '#FFFFFF' },
    order:         { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

export default HeroSlide;
