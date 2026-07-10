import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDynamicField extends Document {
  name: string;
  target: "lead" | "customer" | "project" | "invoice" | "task" | "order";
  type: string;
  required: boolean;
  tenantScope: string;
  companyId?: mongoose.Types.ObjectId;
  section?: string;
  order?: number;
  options?: string[]; // For dropdown types
  customCss?: string; // For field-level CSS overrides
  createdAt: Date;
  updatedAt: Date;
}

const dynamicFieldSchema = new Schema<IDynamicField>(
  {
    name: { type: String, required: true, trim: true },
    target: { 
      type: String, 
      enum: ["lead", "customer", "project", "invoice", "task", "order"], 
      required: true 
    },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    tenantScope: { type: String, default: "Global" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: false },
    section: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    options: [{ type: String }],
    customCss: { type: String, default: "" },
  },
  { timestamps: true }
);

const DynamicField: Model<IDynamicField> = mongoose.models.DynamicField || mongoose.model<IDynamicField>("DynamicField", dynamicFieldSchema);

export default DynamicField;
