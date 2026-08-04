import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompanyModule extends Document {
  company_id: mongoose.Types.ObjectId;
  module_id: string; // e.g., 'leads', 'patients'
  visible: boolean;
  display_name: string;
  sort_order: number;
  is_customized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companyModuleSchema = new Schema<ICompanyModule>(
  {
    company_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    module_id: { type: String, required: true },
    visible: { type: Boolean, default: true },
    display_name: { type: String, required: true },
    sort_order: { type: Number, default: 0 },
    is_customized: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure a company can only have one configuration per module
companyModuleSchema.index({ company_id: 1, module_id: 1 }, { unique: true });

if (mongoose.models.CompanyModule) {
  delete mongoose.models.CompanyModule;
}

const CompanyModule: Model<ICompanyModule> = mongoose.model<ICompanyModule>("CompanyModule", companyModuleSchema);

export default CompanyModule;
