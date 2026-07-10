import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  companyId?: mongoose.Types.ObjectId;
  title: any;
  status: any;
  customData?: Record<string, any>;
}

const TaskSchema = new Schema<ITask>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  title: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
