import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadStage extends Document {
  name: string;
  color: string; // e.g. "#3B82F6"
  order: number;
  active: boolean;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeadStageSchema: Schema<ILeadStage> = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: "#3B82F6" },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

const LeadStage: Model<ILeadStage> = mongoose.models.LeadStage || mongoose.model<ILeadStage>("LeadStage", LeadStageSchema);

export default LeadStage;
