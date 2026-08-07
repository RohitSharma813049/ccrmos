import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIndustryTemplate extends Document {
  name: string;
  industry_id: mongoose.Types.ObjectId;
  is_default: boolean;
  created_by?: mongoose.Types.ObjectId;
  description?: string;
  modules: any[]; // Configured custom modules (legacy)
  fields: any[]; // Configured dynamic fields
  createdAt: Date;
  updatedAt: Date;
}

const industryTemplateSchema = new Schema<IIndustryTemplate>(
  {
    name: { type: String, required: true, trim: true },
    industry_id: { type: Schema.Types.ObjectId, ref: "Industry", required: true },
    is_default: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    modules: [{ type: Schema.Types.Mixed }],
    fields: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

const IndustryTemplate: Model<IIndustryTemplate> = mongoose.models.IndustryTemplate || mongoose.model<IIndustryTemplate>("IndustryTemplate", industryTemplateSchema);

export default IndustryTemplate;
