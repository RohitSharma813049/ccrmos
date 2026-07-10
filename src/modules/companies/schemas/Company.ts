import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  adminEmail: string;
  plan: "Basic" | "Pro" | "Enterprise";
  usersQuota: number;
  country?: string;
  currency?: string;
  status: "Active" | "Suspended";
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    plan: { type: String, enum: ["Basic", "Pro", "Enterprise"], default: "Basic" },
    usersQuota: { type: Number, default: 5 },
    country: { type: String, default: "US" },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
  },
  { timestamps: true }
);

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);

export default Company;
