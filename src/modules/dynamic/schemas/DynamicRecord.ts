import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDynamicRecord extends Document {
  moduleId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const dynamicRecordSchema = new Schema<IDynamicRecord>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    data: { type: Map, of: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Delete the cached model if it exists to allow Next.js Fast Refresh to update schema
const DynamicRecord: Model<IDynamicRecord> = mongoose.models.DynamicRecord || mongoose.model<IDynamicRecord>("DynamicRecord", dynamicRecordSchema);

export default DynamicRecord;
