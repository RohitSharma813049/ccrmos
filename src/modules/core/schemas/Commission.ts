import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommission extends Document {
  companyId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  
  dealValue: number;
  grossCommissionAmount: number; // What the agency makes (e.g. 3% of dealValue)
  agentSplitPercentage: number; // e.g. 70 means agent keeps 70% of gross
  agentTakeHomeAmount: number;
  currency: string;
  
  status: "Pending" | "Paid" | "Void";
  paymentDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema<ICommission> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  
  dealValue: { type: Number, required: true },
  grossCommissionAmount: { type: Number, required: true },
  agentSplitPercentage: { type: Number, required: true, default: 50 },
  agentTakeHomeAmount: { type: Number, required: true },
  currency: { type: String, default: "USD", required: true },
  
  status: { type: String, enum: ["Pending", "Paid", "Void"], default: "Pending" },
  paymentDate: { type: Date }
}, { timestamps: true });

CommissionSchema.index({ companyId: 1, agentId: 1 });
CommissionSchema.index({ propertyId: 1 });

const Commission: Model<ICommission> = mongoose.models.Commission || mongoose.model<ICommission>("Commission", CommissionSchema);

export default Commission;
