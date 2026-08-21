import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICampaign extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  type: 'Email' | 'SMS';
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Failed';
  subject?: string;
  content: string; // HTML for Email, plain text for SMS
  targetAudience: {
    status?: string[];
    tags?: string[];
    hasEmail?: boolean;
    hasPhone?: boolean;
  };
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    totalTargeted: number;
    successful: number;
    failed: number;
  };
  createdBy: mongoose.Types.ObjectId;
}

const CampaignSchema: Schema<ICampaign> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Email', 'SMS'], required: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'], default: 'Draft' },
  subject: { type: String },
  content: { type: String, required: true },
  targetAudience: {
    status: [{ type: String }],
    tags: [{ type: String }],
    hasEmail: { type: Boolean, default: false },
    hasPhone: { type: Boolean, default: false }
  },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  stats: {
    totalTargeted: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
export default Campaign;
