import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoice extends Document {
  name: string;
  voiceId: string;
  category: string;
  description: string;
  previewUrl: string;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceSchema: Schema<IVoice> = new Schema({
  name: { type: String, required: true },
  voiceId: { type: String, required: true, unique: true },
  category: { type: String, default: "Custom" },
  description: { type: String, default: "" },
  previewUrl: { type: String, default: "" },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

const Voice: Model<IVoice> = mongoose.models.Voice || mongoose.model<IVoice>("Voice", VoiceSchema);

export default Voice;
