import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITemplateModule extends Document {
  template_id: mongoose.Types.ObjectId;
  module_id: string; // The system identifier for the module, e.g., 'leads', 'patients'
  default_display_name: string;
  sort_order: number;
  createdAt: Date;
  updatedAt: Date;
}

const templateModuleSchema = new Schema<ITemplateModule>(
  {
    template_id: { type: Schema.Types.ObjectId, ref: "IndustryTemplate", required: true },
    module_id: { type: String, required: true },
    default_display_name: { type: String, required: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.TemplateModule) {
  delete mongoose.models.TemplateModule;
}

const TemplateModule: Model<ITemplateModule> = mongoose.model<ITemplateModule>("TemplateModule", templateModuleSchema);

export default TemplateModule;
