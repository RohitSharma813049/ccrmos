import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPipelineStage {
  name: string;
  order: number;
}

export interface IPipeline extends Document {
  companyId: mongoose.Types.ObjectId;
  module: string; // e.g. "lead", "customer"
  stages: IPipelineStage[];
}

const pipelineStageSchema = new Schema<IPipelineStage>({
  name: { type: String, required: true },
  order: { type: Number, required: true },
});

const pipelineSchema = new Schema<IPipeline>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  module: { type: String, required: true },
  stages: { type: [pipelineStageSchema], default: [] },
}, { timestamps: true });

// Ensure one pipeline per module per company
pipelineSchema.index({ companyId: 1, module: 1 }, { unique: true });

const Pipeline: Model<IPipeline> = mongoose.models.Pipeline || mongoose.model<IPipeline>('Pipeline', pipelineSchema);
export default Pipeline;
