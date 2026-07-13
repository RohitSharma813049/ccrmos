import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  adminEmail: string;
  plan: string;
  usersQuota: number;
  country?: string;
  currency?: string;
  status: "Active" | "Suspended";
  subscriptionPlanId?: mongoose.Types.ObjectId | string;
  subscriptionStatus?: "trialing" | "active" | "past_due" | "canceled";
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    plan: { type: String, default: "Basic" },
    usersQuota: { type: Number, default: 5 },
    country: { type: String, default: "US" },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    subscriptionPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    subscriptionStatus: { type: String, enum: ["trialing", "active", "past_due", "canceled"], default: "trialing" },
    razorpayCustomerId: { type: String },
    razorpaySubscriptionId: { type: String },
  },
  { timestamps: true }
);

const Company: Model<ICompany> = mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);

export default Company;
