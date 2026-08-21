import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplate extends Document {
  companyId?: mongoose.Types.ObjectId;
  name: string;
  type: string; // e.g. "quote", "contract", "proposal"
  content: string; // HTML string with placeholders like {{customerName}}
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  type: { type: String, default: 'document' },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', templateSchema);
export default Template;
