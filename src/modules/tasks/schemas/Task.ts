import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface ITask extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  title: any;
  status: any;
  customData?: Record<string, any>;
}

const TaskSchema = new Schema<ITask>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  title: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

TaskSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    try {
      const counterId = `task_seq_${this.companyId || 'global'}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId } },
        { new: true, upsert: true }
      );
      this.displayId = `TSK-${String(counter.seq).padStart(4, '0')}`;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
