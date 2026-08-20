import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  companyId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId; // The user who performed the action
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT";
  targetModel?: "Lead" | "Property" | "User" | "Company" | "Invoice" | "Document" | "Role";
  targetId?: mongoose.Types.ObjectId;
  changes?: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { 
    type: String, 
    enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"], 
    required: true 
  },
  targetModel: { 
    type: String, 
    enum: ["Lead", "Property", "User", "Company", "Invoice", "Document", "Role"] 
  },
  targetId: { type: Schema.Types.ObjectId },
  changes: { 
    type: Schema.Types.Mixed 
  },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Optimize queries for audit history
AuditLogSchema.index({ companyId: 1, createdAt: -1 });
AuditLogSchema.index({ companyId: 1, targetModel: 1, targetId: 1 });
AuditLogSchema.index({ companyId: 1, actorId: 1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
