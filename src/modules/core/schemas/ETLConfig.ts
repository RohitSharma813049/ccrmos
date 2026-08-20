import mongoose, { Schema, Document, Model } from "mongoose";

export interface IETLConfig extends Document {
  companyId: mongoose.Types.ObjectId;
  destination: "AWS_S3" | "GCP_CLOUD_STORAGE";
  
  // Storage Credentials
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string; // Should ideally be encrypted in production
  
  // Pipeline Settings
  exportFrequency: "DAILY" | "WEEKLY" | "REALTIME";
  includeCollections: string[]; // e.g. ["leads", "properties", "auditlogs"]
  
  // State
  lastExportDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ETLConfigSchema: Schema<IETLConfig> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
  destination: { type: String, enum: ["AWS_S3", "GCP_CLOUD_STORAGE"], required: true },
  
  bucketName: { type: String, required: true },
  region: { type: String, required: true },
  accessKeyId: { type: String, required: true },
  secretAccessKey: { type: String, required: true },
  
  exportFrequency: { type: String, enum: ["DAILY", "WEEKLY", "REALTIME"], default: "DAILY" },
  includeCollections: [{ type: String }],
  
  lastExportDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ETLConfig: Model<IETLConfig> = mongoose.models.ETLConfig || mongoose.model<IETLConfig>("ETLConfig", ETLConfigSchema);

export default ETLConfig;
