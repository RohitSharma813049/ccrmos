import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICallLog extends Document {
  companyId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "voicemail" | "failed" | "in-progress";
  durationSeconds?: number;
  recordingUrl?: string;
  transcription?: string;
  twilioCallSid?: string;
  fromNumber: string;
  toNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallLogSchema: Schema<ICallLog> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  status: { 
    type: String, 
    enum: ["completed", "missed", "voicemail", "failed", "in-progress"],
    default: "in-progress"
  },
  durationSeconds: { type: Number, default: 0 },
  recordingUrl: { type: String },
  transcription: { type: String },
  twilioCallSid: { type: String, unique: true, sparse: true },
  fromNumber: { type: String, required: true },
  toNumber: { type: String, required: true }
}, { timestamps: true });

CallLogSchema.index({ companyId: 1, leadId: 1 });
CallLogSchema.index({ companyId: 1, agentId: 1 });
CallLogSchema.index({ twilioCallSid: 1 });

const CallLog: Model<ICallLog> = mongoose.models.CallLog || mongoose.model<ICallLog>("CallLog", CallLogSchema);

export default CallLog;
