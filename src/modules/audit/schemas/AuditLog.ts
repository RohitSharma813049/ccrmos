import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  module: string;
  recordId: string;
  action: string;
  changes: Record<string, any>;
  ipAddress?: string;
  device?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: String, required: true },
    recordId: { type: String, required: true },
    action: { type: String, required: true },
    changes: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    device: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;
