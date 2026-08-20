import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenantKey extends Document {
  companyId: mongoose.Types.ObjectId;
  
  // The Data Encryption Key (DEK) encrypted by the Master Key
  encryptedDEK: string; 
  
  // The initialization vector used when wrapping the DEK
  iv: string;
  
  // Auth tag for AES-256-GCM verification
  authTag: string;
  
  keyVersion: number;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const TenantKeySchema: Schema<ITenantKey> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  
  encryptedDEK: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  
  keyVersion: { type: Number, default: 1, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// A company should only have one active key at a time, but can keep old keys for decryption
TenantKeySchema.index({ companyId: 1, keyVersion: 1 }, { unique: true });

const TenantKey: Model<ITenantKey> = mongoose.models.TenantKey || mongoose.model<ITenantKey>("TenantKey", TenantKeySchema);

export default TenantKey;
