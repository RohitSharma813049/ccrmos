import mongoose, { Document, Schema } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';
import { calculateInvoice, IInvoiceItem } from '@/lib/invoice-calculator';

export interface IInvoice extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  shippingFee: number;
  amount: number; // Grand Total
  currency: string;
  status: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  customData?: Record<string, any>;
  shareToken?: string;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  invoiceNumber: { type: String, required: true },
  items: { type: [InvoiceItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'Unpaid' },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  customData: { type: Schema.Types.Mixed, default: {} },
  shareToken: { type: String, unique: true, sparse: true }
}, { timestamps: true });

InvoiceSchema.pre('save', async function (this: IInvoice) {
  // Always execute backend calculation before saving
  const calc = calculateInvoice({
    items: this.items,
    amount: this.amount,
    subtotal: this.subtotal,
    taxRate: this.taxRate,
    taxAmount: this.taxAmount,
    discountRate: this.discountRate,
    discountAmount: this.discountAmount,
    shippingFee: this.shippingFee,
    currency: this.currency,
  });

  this.items = calc.items as any;
  this.subtotal = calc.subtotal;
  this.taxRate = calc.taxRate;
  this.taxAmount = calc.taxAmount;
  this.discountRate = calc.discountRate;
  this.discountAmount = calc.discountAmount;
  this.shippingFee = calc.shippingFee;
  this.amount = calc.amount;
  this.currency = calc.currency;

  if (this.isNew && !this.displayId) {
    const counterId = `invoice_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `INV-${String(counter.seq).padStart(4, '0')}`;
  }
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
