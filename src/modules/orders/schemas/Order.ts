import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  orderNumber: any;
  amount: any;
  status: any;
  customData?: Record<string, any>;
}

const OrderSchema = new Schema<IOrder>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  orderNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  customData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
