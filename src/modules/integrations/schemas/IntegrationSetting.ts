import mongoose, { Schema, Document } from 'mongoose';

export interface IIntegrationSetting extends Document {
  companyId: string;
  integrationType: string;
  scopeType: 'COMPANY' | 'PROJECT' | 'PIPELINE' | 'FORM';
  scopeId: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSettingSchema: Schema = new Schema({
  companyId: { type: String, required: true },
  integrationType: { type: String, required: true },
  scopeType: { 
    type: String, 
    enum: ['COMPANY', 'PROJECT', 'PIPELINE', 'FORM'],
    required: true,
    default: 'COMPANY'
  },
  scopeId: { type: String, required: true }, // For COMPANY, this is just companyId
  config: { type: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Ensure uniqueness per integration type per scope
IntegrationSettingSchema.index({ companyId: 1, integrationType: 1, scopeType: 1, scopeId: 1 }, { unique: true });

export default mongoose.models.IntegrationSetting || mongoose.model<IIntegrationSetting>('IntegrationSetting', IntegrationSettingSchema);
