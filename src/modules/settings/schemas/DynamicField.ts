import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDynamicField extends Document {
  name: string;
  target: string;
  type: string;
  required: boolean;
  tenantScope: string;
  companyId?: mongoose.Types.ObjectId;
  industryId?: mongoose.Types.ObjectId;
  section?: string;
  order?: number;
  options?: string[]; // For dropdown types
  optionColors?: Record<string, string>; // Maps option label to color
  customCss?: string; // For field-level CSS overrides
  disabledBy?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const dynamicFieldSchema = new Schema<IDynamicField>(
  {
    name: { type: String, required: true, trim: true },
    target: { 
      type: String, 
      required: true 
    },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    tenantScope: { type: String, default: "Global" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: false },
    industryId: { type: Schema.Types.ObjectId, ref: "Industry", required: false },
    section: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    options: [{ type: String }],
    optionColors: { type: Map, of: String },
    customCss: { type: String, default: "" },
    disabledBy: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
  },
  { timestamps: true }
);

const DynamicField: Model<IDynamicField> = mongoose.models.DynamicField || mongoose.model<IDynamicField>("DynamicField", dynamicFieldSchema);

export default DynamicField;
