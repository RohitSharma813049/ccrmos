import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISequenceEnrollment extends Document {
  companyId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  sequenceId: mongoose.Types.ObjectId;
  currentStepIndex: number;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "FAILED";
  nextExecutionDate: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SequenceEnrollmentSchema: Schema<ISequenceEnrollment> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  sequenceId: { type: Schema.Types.ObjectId, ref: "Sequence", required: true },
  currentStepIndex: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["ACTIVE", "COMPLETED", "PAUSED", "FAILED"], 
    default: "ACTIVE" 
  },
  nextExecutionDate: { type: Date, required: true },
  errorMessage: { type: String }
}, { timestamps: true });

// Optimize for the cron job query
SequenceEnrollmentSchema.index({ status: 1, nextExecutionDate: 1 });
SequenceEnrollmentSchema.index({ companyId: 1, leadId: 1 });

const SequenceEnrollment: Model<ISequenceEnrollment> = mongoose.models.SequenceEnrollment || mongoose.model<ISequenceEnrollment>("SequenceEnrollment", SequenceEnrollmentSchema);

export default SequenceEnrollment;
