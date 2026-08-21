import mongoose, { Schema, Document, Model } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';
import Project from '@/modules/projects/schemas/Project';
import Invoice from '@/modules/invoices/schemas/Invoice';
import Task from '@/modules/tasks/schemas/Task';
import Order from '@/modules/orders/schemas/Order';

export interface ICustomer extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  status: string;
  customData: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  hasPortalAccess?: boolean;
  portalPassword?: string;
  portalLastLogin?: Date;
  
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
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  country: { type: String, default: "US" },
  currency: { type: String, default: "USD" },
  status: { type: String, default: 'active' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  hasPortalAccess: { type: Boolean, default: false },
  portalPassword: { type: String },
  portalLastLogin: { type: Date },
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, strict: false });

customerSchema.pre('save', async function (this: ICustomer) {
  if (this.isNew && !this.displayId) {
    const counterId = `customer_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `CRT-${String(counter.seq).padStart(4, '0')}`;
  }
});

customerSchema.pre('findOneAndDelete', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate) {
    const customerIdStr = docToUpdate._id.toString();
    await Project.deleteMany({ "customData.customerId": customerIdStr });
    await Invoice.deleteMany({ "customData.customerId": customerIdStr });
    await Task.deleteMany({ "customData.customerId": customerIdStr });
    await Order.deleteMany({ "customData.customerId": customerIdStr });
  }
});

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
