import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailSyncConfig extends Document {
  companyId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId; // The user connecting their inbox
  provider: "GMAIL" | "OUTLOOK" | "IMAP";
  emailAddress: string;
  
  // OAuth Tokens (should be encrypted in a real production environment)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // IMAP Settings (if using direct IMAP)
  imapHost?: string;
  imapPort?: number;
  imapUsername?: string;
  imapPassword?: string;
  
  syncStatus: "ACTIVE" | "NEEDS_AUTH" | "ERROR" | "PAUSED";
  lastSyncedAt?: Date;
  errorMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const EmailSyncConfigSchema: Schema<IEmailSyncConfig> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  agentId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // 1 inbox per agent for now
  provider: { type: String, enum: ["GMAIL", "OUTLOOK", "IMAP"], required: true },
  emailAddress: { type: String, required: true },
  
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  
  imapHost: { type: String },
  imapPort: { type: Number },
  imapUsername: { type: String },
  imapPassword: { type: String },
  
  syncStatus: { type: String, enum: ["ACTIVE", "NEEDS_AUTH", "ERROR", "PAUSED"], default: "NEEDS_AUTH" },
  lastSyncedAt: { type: Date },
  errorMessage: { type: String }
}, { timestamps: true });

EmailSyncConfigSchema.index({ companyId: 1, emailAddress: 1 });

const EmailSyncConfig: Model<IEmailSyncConfig> = mongoose.models.EmailSyncConfig || mongoose.model<IEmailSyncConfig>("EmailSyncConfig", EmailSyncConfigSchema);

export default EmailSyncConfig;
