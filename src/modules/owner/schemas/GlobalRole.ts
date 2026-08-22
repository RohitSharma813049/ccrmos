import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalRole extends Document {
  name: string;
  description?: string;
  tenantScope?: string;
  industryId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  permissions: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalRoleSchema = new Schema<IGlobalRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    tenantScope: { type: String, enum: ['Global', 'Industry', 'Company'], default: 'Global' },
    industryId: { type: Schema.Types.ObjectId, ref: 'Industry' },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    permissions: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GlobalRole: Model<IGlobalRole> =
  mongoose.models.GlobalRole || mongoose.model<IGlobalRole>('GlobalRole', GlobalRoleSchema);

export default GlobalRole;
