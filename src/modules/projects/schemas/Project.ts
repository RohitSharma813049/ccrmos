import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  companyId?: mongoose.Types.ObjectId;
  name: any;
  status: any;
  customData?: Record<string, any>;
}

const ProjectSchema = new Schema<IProject>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  status: { type: String, default: 'Active' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
