import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIntegrationLink extends Document {
  companyId: mongoose.Types.ObjectId | string;
  integrationId: string;
  integrationName: string;
  projectId?: mongoose.Types.ObjectId | string;
  formId?: mongoose.Types.ObjectId | string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const integrationLinkSchema = new Schema<IIntegrationLink>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    integrationId: { type: String, required: true },
    integrationName: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    formId: { type: Schema.Types.ObjectId, ref: "Form" },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

const IntegrationLink: Model<IIntegrationLink> = mongoose.models.IntegrationLink || mongoose.model<IIntegrationLink>("IntegrationLink", integrationLinkSchema);

export default IntegrationLink;
