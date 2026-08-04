import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  departmentCode?: string;
  companyId: mongoose.Types.ObjectId;
  industryId?: mongoose.Types.ObjectId;
  isActive: boolean;
  dynamicData?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema<IDepartment> = new Schema(
  {
    name: { type: String, required: true },
    departmentCode: { type: String, sparse: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    industryId: { type: Schema.Types.ObjectId, ref: "Industry" },
    isActive: { type: Boolean, default: true },
    dynamicData: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
