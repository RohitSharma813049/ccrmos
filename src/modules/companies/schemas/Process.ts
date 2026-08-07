import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProcess extends Document {
  name: string;
  processCode?: string;
  companyId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  isActive: boolean;
  dynamicData?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessSchema: Schema<IProcess> = new Schema(
  {
    name: { type: String, required: true },
    processCode: { type: String, sparse: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    isActive: { type: Boolean, default: true },
    dynamicData: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Ensure a department cannot have multiple processes with the same name
ProcessSchema.index({ departmentId: 1, name: 1 }, { unique: true });

const Process: Model<IProcess> =
  mongoose.models.Process || mongoose.model<IProcess>("Process", ProcessSchema);

export default Process;
