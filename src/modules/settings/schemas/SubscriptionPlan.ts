import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  billing: "Monthly" | "Yearly";
  users: string;
  features: string[];
  maxCustomForms: number;
  maxUsers: number;
  maxRoles: number;
  maxTeams: number;
  maxCampaigns: number;
  aiFeatures: boolean;
  apiIntegration: boolean;
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
    users: { type: String, required: true }, // keeping this for backwards compatibility or display
    features: [{ type: String }],
    maxCustomForms: { type: Number, default: 2 },
    maxUsers: { type: Number, default: 5 },
    maxRoles: { type: Number, default: 3 },
    maxTeams: { type: Number, default: 2 },
    maxCampaigns: { type: Number, default: 0 },
    aiFeatures: { type: Boolean, default: false },
    apiIntegration: { type: Boolean, default: false },
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
