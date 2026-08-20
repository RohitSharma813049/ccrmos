import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISequenceStep {
  actionType: "EMAIL" | "WHATSAPP" | "SMS" | "DELAY";
  delayInDays: number; // e.g., 2 days after the previous step
  subject?: string;
  content: string; // The email body or message text
}

export interface ISequence extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  triggerEvent: "MANUAL" | "LEAD_CREATED" | "PROPERTY_INQUIRY";
  steps: ISequenceStep[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SequenceStepSchema = new Schema<ISequenceStep>({
  actionType: { type: String, enum: ["EMAIL", "WHATSAPP", "SMS", "DELAY"], required: true },
  delayInDays: { type: Number, required: true, default: 0 },
  subject: { type: String },
  content: { type: String, required: true }
});

const SequenceSchema: Schema<ISequence> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  description: { type: String },
  triggerEvent: { 
    type: String, 
    enum: ["MANUAL", "LEAD_CREATED", "PROPERTY_INQUIRY"], 
    default: "MANUAL" 
  },
  steps: [SequenceStepSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

SequenceSchema.index({ companyId: 1, isActive: 1 });

const Sequence: Model<ISequence> = mongoose.models.Sequence || mongoose.model<ISequence>("Sequence", SequenceSchema);

export default Sequence;
