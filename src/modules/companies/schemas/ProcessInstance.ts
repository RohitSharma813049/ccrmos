import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcessInstance extends Document {
  processId: mongoose.Types.ObjectId;
  targetRecordId: mongoose.Types.ObjectId;
  targetModuleId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  currentStageIndex: number;
  stageStartedAt: Date;
  status: "In Progress" | "Completed" | "Overdue";
  createdAt: Date;
  updatedAt: Date;
}

const ProcessInstanceSchema: Schema<IProcessInstance> = new Schema(
  {
    processId: { type: Schema.Types.ObjectId, ref: "Process", required: true },
    targetRecordId: { type: Schema.Types.ObjectId, required: true },
    targetModuleId: { type: Schema.Types.ObjectId, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    currentStageIndex: { type: Number, default: 1 },
    stageStartedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["In Progress", "Completed", "Overdue"], default: "In Progress" },
  },
  { timestamps: true }
);

const ProcessInstance: Model<IProcessInstance> =
  mongoose.models.ProcessInstance || mongoose.model<IProcessInstance>("ProcessInstance", ProcessInstanceSchema);

export default ProcessInstance;
