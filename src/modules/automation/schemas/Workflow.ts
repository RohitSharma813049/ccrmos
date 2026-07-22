import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkflowCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: string;
}

export interface IWorkflowAction {
  type: "Create Task" | "Send Email" | "Assign User" | "Canvas";
  payload: any;
}

export interface IWorkflow extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  active: boolean;
  trigger: string;
  conditions: IWorkflowCondition[];
  actions: IWorkflowAction[];
  createdAt: Date;
  updatedAt: Date;
}

const workflowSchema = new Schema<IWorkflow>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: false },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true },
    trigger: { type: String, required: true },
    conditions: [
      {
        field: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: String, required: true },
      }
    ],
    actions: [
      {
        type: { type: String, required: true },
        payload: { type: Schema.Types.Mixed, required: true },
      }
    ]
  },
  { timestamps: true }
);

const Workflow: Model<IWorkflow> = mongoose.models.Workflow || mongoose.model<IWorkflow>("Workflow", workflowSchema);

export default Workflow;
