import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApiKey extends Document {
  name: string;
  key: string;
  founderId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    founderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
