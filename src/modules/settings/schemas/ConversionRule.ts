import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFieldMapping {
  sourceField: string;
  targetField: string;
}

export interface IConversionRule extends Document {
  companyId: mongoose.Types.ObjectId;
  sourceModule: string; // The module initiating the conversion
  targetModule: string; // The module to convert into
  buttonLabel: string; // E.g., 'Convert to Project'
  fieldMappings: IFieldMapping[];
  isActive: boolean;
}

const fieldMappingSchema = new Schema<IFieldMapping>({
  sourceField: { type: String, required: true },
  targetField: { type: String, required: true },
}, { _id: false });

const conversionRuleSchema = new Schema<IConversionRule>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  sourceModule: { type: String, required: true },
  targetModule: { type: String, required: true },
  buttonLabel: { type: String, required: true },
  fieldMappings: { type: [fieldMappingSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ConversionRule: Model<IConversionRule> = mongoose.models.ConversionRule || mongoose.model<IConversionRule>('ConversionRule', conversionRuleSchema);
export default ConversionRule;
