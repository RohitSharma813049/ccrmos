import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface ITask extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: string;
  customData?: Record<string, any>;
}

const TaskSchema = new Schema<ITask>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

TaskSchema.pre('save', async function (this: ITask) {
  if (this.isNew && !this.displayId) {
    const counterId = `task_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `TSK-${String(counter.seq).padStart(4, '0')}`;
  }
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
