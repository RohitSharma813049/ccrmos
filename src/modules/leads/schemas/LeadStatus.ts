import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadStatus extends Document {
  name: string;
  stageId: mongoose.Types.ObjectId;
  active: boolean;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadStatusSchema: Schema<ILeadStatus> = new Schema({
  name: { type: String, required: true },
  stageId: { type: Schema.Types.ObjectId, ref: "LeadStage", required: true },
  active: { type: Boolean, default: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

const LeadStatus: Model<ILeadStatus> = mongoose.models.LeadStatus || mongoose.model<ILeadStatus>("LeadStatus", LeadStatusSchema);

export default LeadStatus;
