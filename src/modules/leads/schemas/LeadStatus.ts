import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadStatus extends Document {
  name: string;
  stageId?: mongoose.Types.ObjectId;
  active: boolean;
  color?: string;
  iconColor?: string;
  category?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadStatusSchema: Schema<ILeadStatus> = new Schema({
  name: { type: String, required: true },
  stageId: { type: Schema.Types.ObjectId, ref: "LeadStage" },
  active: { type: Boolean, default: true },
  color: { type: String, default: "#6b7280" },
  iconColor: { type: String, default: "bg-blue-500" },
  category: { type: String, default: "Interested" },
  companyId: { type: Schema.Types.ObjectId, ref: "Company" },
  founderId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const LeadStatus: Model<ILeadStatus> = mongoose.models.LeadStatus || mongoose.model<ILeadStatus>("LeadStatus", LeadStatusSchema);

export default LeadStatus;
