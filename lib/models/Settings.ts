import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  key: string;
  freeDeliveryThreshold: number;
  logoUrl?: string;
  logoPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    freeDeliveryThreshold: { type: Number, default: 0 },
    logoUrl: { type: String },
    logoPublicId: { type: String },
  },
  { timestamps: true },
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
