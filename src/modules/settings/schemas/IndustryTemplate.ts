import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIndustryTemplate extends Document {
  name: string;
  description?: string;
  modules: any[]; // Configured custom modules
  fields: any[]; // Configured dynamic fields
  createdAt: Date;
  updatedAt: Date;
}

const industryTemplateSchema = new Schema<IIndustryTemplate>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    modules: [{ type: Schema.Types.Mixed }],
    fields: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

const IndustryTemplate: Model<IIndustryTemplate> = mongoose.models.IndustryTemplate || mongoose.model<IIndustryTemplate>("IndustryTemplate", industryTemplateSchema);

export default IndustryTemplate;
