import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomRecord extends Document {
  moduleId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  processId?: mongoose.Types.ObjectId;
  data: Record<string, any>;
  status?: string;
  subStatus?: string;
  source?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customRecordSchema = new Schema<ICustomRecord>({
  moduleId: { type: Schema.Types.ObjectId, ref: 'CustomModule', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  processId: { type: Schema.Types.ObjectId, ref: "Process" },
  data: { type: Map, of: Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'New' },
  subStatus: { type: String },
  source: { type: String, default: 'Manual' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const CustomRecord: Model<ICustomRecord> = mongoose.models.CustomRecord || mongoose.model<ICustomRecord>('CustomRecord', customRecordSchema);
export default CustomRecord;
