import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IApiKey extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema: Schema<IApiKey> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  lastUsedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

ApiKeySchema.index({ companyId: 1 });
ApiKeySchema.index({ key: 1 });

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;

export function generateApiKey(): string {
  return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
}
