import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomField {
  name: string;
  type: string; // 'text', 'number', 'date', 'select', 'phone', 'whatsapp', 'checkbox', 'score', 'relation'
  required: boolean;
  options?: string[]; // for select types
  relationTarget?: string; // e.g., 'Project', 'Lead', etc., used for 'relation' type
}

export interface ICustomModule extends Document {
  name: string;
  active: boolean;
  fields: ICustomField[];
  tenantScope: string;
  industryId?: mongoose.Types.ObjectId | null;
  companyId?: mongoose.Types.ObjectId | null;
  enabledBy?: mongoose.Types.ObjectId[];
}

const customFieldSchema = new Schema<ICustomField>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] },
  relationTarget: { type: String, default: null }
});

const customModuleSchema = new Schema<ICustomModule>({
  name: { type: String, required: true },
  active: { type: Boolean, default: false },
  fields: { type: [customFieldSchema], default: [] },
  tenantScope: { type: String, default: "Global" },
  industryId: { type: Schema.Types.ObjectId, ref: 'Industry', default: null },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null }, // Null means global or industry template
  enabledBy: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
}, { timestamps: true });

const CustomModule: Model<ICustomModule> = mongoose.models.CustomModule || mongoose.model<ICustomModule>('CustomModule', customModuleSchema);
export default CustomModule;
