import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  companyId?: mongoose.Types.ObjectId;
  invoiceNumber: any;
  amount: any;
  status: any;
  customData?: Record<string, any>;
}

const InvoiceSchema = new Schema<IInvoice>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Unpaid' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
