import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIndustry extends Document {
  name: string;
  isActive: boolean;
  description?: string;
  defaultModules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const industrySchema = new Schema<IIndustry>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
    defaultModules: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Delete the cached model if it exists to allow Next.js Fast Refresh to update schema
if (mongoose.models.Industry) {
  delete mongoose.models.Industry;
}

const Industry: Model<IIndustry> = mongoose.model<IIndustry>("Industry", industrySchema);

export default Industry;
