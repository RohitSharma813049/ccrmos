import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    description: { type: String },
    permissions: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to ensure role names are unique per company
RoleSchema.index({ companyId: 1, name: 1 }, { unique: true });

const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
