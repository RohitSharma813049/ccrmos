import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  companyId?: mongoose.Types.ObjectId | null;
  value: any;
}

const systemSettingSchema = new Schema<ISystemSetting>({
  key: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null }, // Null means global platform setting
  value: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// A key should be unique per company (or globally if companyId is null)
systemSettingSchema.index({ key: 1, companyId: 1 }, { unique: true });

const SystemSetting: Model<ISystemSetting> = mongoose.models.SystemSetting || mongoose.model<ISystemSetting>('SystemSetting', systemSettingSchema);
export default SystemSetting;
