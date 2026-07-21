import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhook extends Document {
  name: string;
  endpointUrl: string;
  secret: string;
  events: string[];
  isActive: boolean;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema: Schema<IWebhook> = new Schema(
  {
    name: { type: String, required: true },
    endpointUrl: { type: String, required: true },
    secret: { type: String, required: true },
    events: { type: [String], default: ["*"] },
    isActive: { type: Boolean, default: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: false },
    founderId: { type: Schema.Types.ObjectId, ref: "User", required: false }
  },
  { timestamps: true }
);

const Webhook: Model<IWebhook> = mongoose.models.Webhook || mongoose.model<IWebhook>("Webhook", WebhookSchema);

export default Webhook;
