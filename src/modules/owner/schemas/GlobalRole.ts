import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalRole extends Document {
  name: string;
  description?: string;
  permissions: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalRoleSchema = new Schema<IGlobalRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GlobalRole: Model<IGlobalRole> =
  mongoose.models.GlobalRole || mongoose.model<IGlobalRole>('GlobalRole', GlobalRoleSchema);

export default GlobalRole;
