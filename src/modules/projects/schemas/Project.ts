import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface IProject extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  name: string;
  status: string;
  customData?: Record<string, any>;
}

const ProjectSchema = new Schema<IProject>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  status: { type: String, default: 'Planning' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ProjectSchema.pre('save', async function (this: IProject) {
  if (this.isNew && !this.displayId) {
    const counterId = `project_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `PRO-${String(counter.seq).padStart(4, '0')}`;
  }
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
