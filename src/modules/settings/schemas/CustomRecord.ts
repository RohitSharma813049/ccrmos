import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomRecord extends Document {
  moduleId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const customRecordSchema = new Schema<ICustomRecord>({
  moduleId: { type: Schema.Types.ObjectId, ref: 'CustomModule', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  data: { type: Map, of: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const CustomRecord: Model<ICustomRecord> = mongoose.models.CustomRecord || mongoose.model<ICustomRecord>('CustomRecord', customRecordSchema);
export default CustomRecord;
