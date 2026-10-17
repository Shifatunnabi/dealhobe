import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl:      string;
  imagePublicId: string;
  mobileImageUrl?:      string; // optional phone-only photo; empty = use the desktop image
  mobileImagePublicId?: string;
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
    mobileImageUrl:      { type: String, default: '' },
    mobileImagePublicId: { type: String, default: '' },
    ctaText:       { type: String, default: 'Shop Now' },
    ctaLink:       { type: String, default: '/products' },
    ctaColor:      { type: String, default: '#A41B15' },
    ctaTextColor:  { type: String, default: '#FFFFFF' },
    order:         { type: Number, default: 0 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// In dev, hot reload keeps the first compiled model, so schema changes (like the mobile image fields) would be
// silently ignored and saves would drop the new fields. Re-register the model on every evaluation.
if (process.env.NODE_ENV !== 'production') delete mongoose.models.HeroSlide;

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

export default HeroSlide;
