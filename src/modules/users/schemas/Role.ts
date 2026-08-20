import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRole extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema<IRole> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  description: { type: String },
  permissions: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Ensure unique role names per company
RoleSchema.index({ companyId: 1, name: 1 }, { unique: true });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;
