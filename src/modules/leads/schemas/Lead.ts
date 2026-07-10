import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  companyId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
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

const leadSchema = new Schema<ILead>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  status: { type: String, default: 'new' },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, strict: false });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
