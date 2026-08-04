import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaignSetting extends Document {
  name: string;
  assignedTo?: mongoose.Types.ObjectId;
  type?: string;
  category?: string;
  processed: number;
  lastSynced?: Date;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSettingSchema: Schema<ICampaignSetting> = new Schema({
  name: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  type: { type: String, default: "Buyer" },
  category: { type: String, default: "Hot" },
  processed: { type: Number, default: 0 },
  lastSynced: { type: Date },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

const CampaignSetting: Model<ICampaignSetting> = mongoose.models.CampaignSetting || mongoose.model<ICampaignSetting>("CampaignSetting", CampaignSettingSchema);

export default CampaignSetting;
