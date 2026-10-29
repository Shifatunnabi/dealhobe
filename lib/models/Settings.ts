import mongoose, { Schema, Document, Model } from "mongoose";
import type { Storefront } from "@/lib/homepage/types";

export interface ISettings extends Document {
  key: string;
  freeDeliveryThreshold: number;
  logoUrl?: string;
  logoPublicId?: string;
  storefront?: Partial<Storefront>;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    freeDeliveryThreshold: { type: Number, default: 0 },
    logoUrl: { type: String },
    logoPublicId: { type: String },
    // Navbar pills, trust badges, contact and socials — edited in Admin › Homepage Builder.
    storefront: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production") delete mongoose.models.Settings;

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
