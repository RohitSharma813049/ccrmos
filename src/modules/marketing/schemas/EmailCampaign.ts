import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailCampaign extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  htmlBody: string;
  targetStageId?: mongoose.Types.ObjectId;
  status: 'Draft' | 'Sending' | 'Sent';
  totalSent: number;
  openedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema: Schema<IEmailCampaign> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  targetStageId: { type: Schema.Types.ObjectId, ref: "LeadStage" },
  status: { type: String, enum: ['Draft', 'Sending', 'Sent'], default: 'Draft' },
  totalSent: { type: Number, default: 0 },
  openedBy: [{ type: Schema.Types.ObjectId, ref: "Lead" }]
}, { timestamps: true });

const EmailCampaign: Model<IEmailCampaign> = mongoose.models.EmailCampaign || mongoose.model<IEmailCampaign>("EmailCampaign", EmailCampaignSchema);

export default EmailCampaign;
