import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  area: "inside_dhaka" | "outside_dhaka";
  address: string;
  addresses: {
    label: "home" | "office" | "other";
    fullAddress?: string;
    address?: string;
    area: "inside_dhaka" | "outside_dhaka";
    isDefault: boolean;
  }[];
  isBanned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    area: { type: String, enum: ["inside_dhaka", "outside_dhaka"], required: true },
    address: { type: String, required: true },
    addresses: {
      type: [
        {
          label: { type: String, enum: ["home", "office", "other"], default: "home" },
          fullAddress: { type: String },
          address: { type: String },
          area: { type: String, enum: ["inside_dhaka", "outside_dhaka"], required: true },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
