import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  status: string;
  customData: Record<string, any>;
  createdBy?: mongoose.Types.ObjectId;
}

const customerSchema = new Schema<ICustomer>({
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  country: { type: String, default: "US" },
  currency: { type: String, default: "USD" },
  status: { type: String, default: 'active' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, strict: false });

const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
