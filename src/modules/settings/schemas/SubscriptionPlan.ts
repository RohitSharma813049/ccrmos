import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  billing: "Monthly" | "Yearly";
  users: string;
  features: string[];
  maxCustomForms: number;
  planType: "FIXED" | "CUSTOM";
  allowedModules: string[];
  permissions: Record<string, boolean>;
  isActive: boolean; // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    billing: { type: String, enum: ["Monthly", "Yearly"], default: "Monthly" },
    users: { type: String, required: true },
    features: [{ type: String }],
    maxCustomForms: { type: Number, default: 2 },
    planType: { type: String, enum: ["FIXED", "CUSTOM"], default: "FIXED" },
    allowedModules: [{ type: String }],
    permissions: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan: Model<ISubscriptionPlan> = 
  mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
