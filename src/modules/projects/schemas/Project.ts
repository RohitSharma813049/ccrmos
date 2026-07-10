import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface IProject extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  name: any;
  status: any;
  customData?: Record<string, any>;
}

const ProjectSchema = new Schema<IProject>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  status: { type: String, default: 'Active' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ProjectSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    try {
      const counterId = `project_seq_${this.companyId || 'global'}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId } },
        { new: true, upsert: true }
      );
      this.displayId = `PRO-${String(counter.seq).padStart(4, '0')}`;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
