import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoutingRule extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  priority: number; // Lower number = higher priority (evaluated first)
  
  // Criteria to match against the Lead object
  criteria: {
    source?: string;
    minBudget?: number;
    maxBudget?: number;
    propertyType?: string;
    location?: string;
  };
  
  assignmentMethod: "ROUND_ROBIN" | "DIRECT_ASSIGNMENT";
  
  // For DIRECT_ASSIGNMENT, only the first agent is used
  // For ROUND_ROBIN, we cycle through this pool
  agentPool: mongoose.Types.ObjectId[];
  
  // The state for Round Robin
  currentPoolIndex: number;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoutingRuleSchema: Schema<IRoutingRule> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  priority: { type: Number, required: true, default: 100 },
  
  criteria: {
    source: { type: String },
    minBudget: { type: Number },
    maxBudget: { type: Number },
    propertyType: { type: String },
    location: { type: String }
  },
  
  assignmentMethod: { 
    type: String, 
    enum: ["ROUND_ROBIN", "DIRECT_ASSIGNMENT"], 
    required: true,
    default: "ROUND_ROBIN"
  },
  
  agentPool: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  
  currentPoolIndex: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Optimize for fetching active rules sorted by priority
RoutingRuleSchema.index({ companyId: 1, isActive: 1, priority: 1 });

const RoutingRule: Model<IRoutingRule> = mongoose.models.RoutingRule || mongoose.model<IRoutingRule>("RoutingRule", RoutingRuleSchema);

export default RoutingRule;
