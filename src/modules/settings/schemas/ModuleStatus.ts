import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IModuleStatus extends Document {
  companyId: mongoose.Types.ObjectId;
  moduleName: string; // The target module this status belongs to (e.g., 'Leads', 'Projects', or Custom Module ID)
  type: 'status' | 'stage'; // Whether this is a generic Status or a Pipeline Stage
  name: string;
  color: string;
  order: number;
  slaHours?: number; // Workflow: How many hours before this stage expires
  autoNotifyBeforeHours?: number; // Workflow: How many hours before expiry to send a notification
  subStatuses?: string[];
  isDefault: boolean;
  isActive: boolean;
}

const moduleStatusSchema = new Schema<IModuleStatus>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  moduleName: { type: String, required: true },
  type: { type: String, enum: ['status', 'stage'], default: 'status' },
  name: { type: String, required: true },
  color: { type: String, default: '#6b7280' },
  order: { type: Number, default: 0 },
  slaHours: { type: Number },
  autoNotifyBeforeHours: { type: Number },
  subStatuses: [{ type: String }],
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ModuleStatus: Model<IModuleStatus> = mongoose.models.ModuleStatus || mongoose.model<IModuleStatus>('ModuleStatus', moduleStatusSchema);
export default ModuleStatus;
