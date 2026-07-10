import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface IInvoice extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  invoiceNumber: any;
  amount: any;
  status: any;
  customData?: Record<string, any>;
}

const InvoiceSchema = new Schema<IInvoice>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Unpaid' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

InvoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    try {
      const counterId = `invoice_seq_${this.companyId || 'global'}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId } },
        { new: true, upsert: true }
      );
      this.displayId = `INV-${String(counter.seq).padStart(4, '0')}`;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
