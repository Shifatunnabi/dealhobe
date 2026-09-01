import mongoose, { Schema, Document, Model } from "mongoose";

export interface LoyaltyRange {
  min: number;
  max?: number | null;
  points: number;
}

export interface ISettings extends Document {
  key: string;
  freeDeliveryThreshold: number;
  loyaltyRanges: LoyaltyRange[];
  logoUrl?: string;
  logoPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyRangeSchema = new Schema<LoyaltyRange>(
  {
    min: { type: Number, required: true },
    max: { type: Number },
    points: { type: Number, required: true },
  },
  { _id: false },
);

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    freeDeliveryThreshold: { type: Number, default: 0 },
    loyaltyRanges: { type: [LoyaltyRangeSchema], default: [] },
    logoUrl: { type: String },
    logoPublicId: { type: String },
  },
  { timestamps: true },
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
