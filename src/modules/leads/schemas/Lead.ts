import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  status: string;
  customData: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId;
}

const leadSchema = new Schema<ILead>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  status: { type: String, default: 'new' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
