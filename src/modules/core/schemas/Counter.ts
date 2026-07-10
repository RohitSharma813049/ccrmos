import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounter extends Document {
  _id: string; // The sequence name, e.g., "lead_seq"
  companyId?: mongoose.Types.ObjectId;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  seq: { type: Number, default: 0 }
}, { _id: false }); // _id is explicitly defined above as String

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);
export default Counter;
