import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  adminEmail: string;
  plan: string;
  usersQuota: number;
  country?: string;
  currency?: string;
  industryId?: mongoose.Types.ObjectId | string;
  status: "Active" | "Suspended";
  subscriptionPlanId?: mongoose.Types.ObjectId | string;
  subscriptionStatus?: "pending_payment" | "trialing" | "active" | "past_due" | "canceled";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  checkoutToken?: string;
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
    industryId: { type: Schema.Types.ObjectId, ref: 'Industry' },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    subscriptionPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    subscriptionStatus: { type: String, enum: ["pending_payment", "trialing", "active", "past_due", "canceled"], default: "trialing" },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    checkoutToken: { type: String },
  },
  { timestamps: true }
);

// Delete the cached model if it exists to allow Next.js Fast Refresh to update schema
if (mongoose.models.Company) {
  delete mongoose.models.Company;
}

const Company: Model<ICompany> = mongoose.model<ICompany>("Company", companySchema);

export default Company;
