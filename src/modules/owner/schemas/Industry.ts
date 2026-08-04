import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIndustry extends Document {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IndustrySchema = new Schema<IIndustry>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Industry: Model<IIndustry> =
  mongoose.models.Industry || mongoose.model<IIndustry>('Industry', IndustrySchema);

export default Industry;
