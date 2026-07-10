import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRole extends Document {
  name: string;
  companyId?: mongoose.Types.ObjectId;
  description?: string;
  permissions: {
    [module: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      [customAction: string]: boolean;
    };
  };
  isSystem: boolean; // True for default roles like Founder that shouldn't be deleted
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema<IRole> = new Schema(
  {
    name: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: false },
    description: { type: String },
    permissions: { type: Schema.Types.Mixed, default: {} },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure role names are unique per company
RoleSchema.index({ name: 1, companyId: 1 }, { unique: true });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;
