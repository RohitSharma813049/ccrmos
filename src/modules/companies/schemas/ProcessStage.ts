import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcessStage extends Document {
  processId: mongoose.Types.ObjectId;
  sequenceOrder: number;
  name: string;
  assignedToRole?: string;
  assignedToUser?: mongoose.Types.ObjectId;
  slaHours: number;
  autoNotifyBeforeHours: number;
  autoNotifyAfterHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStageSchema: Schema<IProcessStage> = new Schema(
  {
    processId: { type: Schema.Types.ObjectId, ref: "Process", required: true },
    sequenceOrder: { type: Number, required: true },
    name: { type: String, required: true },
    assignedToRole: { type: String },
    assignedToUser: { type: Schema.Types.ObjectId, ref: "User" },
    slaHours: { type: Number, default: 24 },
    autoNotifyBeforeHours: { type: Number, default: 2 },
    autoNotifyAfterHours: { type: Number, default: 2 },
  },
  { timestamps: true }
);

ProcessStageSchema.index({ processId: 1, sequenceOrder: 1 }, { unique: true });

const ProcessStage: Model<IProcessStage> =
  mongoose.models.ProcessStage || mongoose.model<IProcessStage>("ProcessStage", ProcessStageSchema);

export default ProcessStage;
