import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkflowLog extends Document {
  companyId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  trigger: string;
  targetId: string; // The ID of the record that triggered this (e.g. Lead ID)
  status: "success" | "error";
  details: string;
  createdAt: Date;
}

const workflowLogSchema = new Schema<IWorkflowLog>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true },
    trigger: { type: String, required: true },
    targetId: { type: String, required: true },
    status: { type: String, enum: ["success", "error"], required: true },
    details: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WorkflowLog: Model<IWorkflowLog> = mongoose.models.WorkflowLog || mongoose.model<IWorkflowLog>("WorkflowLog", workflowLogSchema);

export default WorkflowLog;
