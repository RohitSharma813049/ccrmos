import mongoose, { Schema, Document, Model } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface ICustomer extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  status: string;
  customData: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId;
  
  // Ownership Chain
  departmentId?: mongoose.Types.ObjectId;
  directorId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  teamLeaderId?: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
}

const customerSchema = new Schema<ICustomer>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  country: { type: String, default: "US" },
  currency: { type: String, default: "USD" },
  status: { type: String, default: 'active' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, strict: false });

customerSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    try {
      const counterId = `customer_seq_${this.companyId || 'global'}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId } },
        { new: true, upsert: true }
      );
      this.displayId = `CRT-${String(counter.seq).padStart(4, '0')}`;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
