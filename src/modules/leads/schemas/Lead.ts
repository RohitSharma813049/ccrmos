import mongoose, { Schema, Document, Model } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface ILead extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  
  // Ownership Chain
  departmentId?: mongoose.Types.ObjectId;
  directorId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  teamLeaderId?: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  
  customData?: any;
}

const leadSchema = new Schema<ILead>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, default: 'new' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, strict: false });

leadSchema.pre('save', async function (this: ILead) {
  if (this.isNew && !this.displayId) {
    const counterId = `lead_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `CRM-${String(counter.seq).padStart(4, '0')}`;
  }
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
