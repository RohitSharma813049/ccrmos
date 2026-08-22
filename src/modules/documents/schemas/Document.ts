import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export interface IDocument extends MongooseDocument {
  companyId: mongoose.Types.ObjectId;
  name: string;
  type: "file" | "folder";
  size?: number; // in bytes
  mimeType?: string;
  fileUrl?: string; // S3 or Blob URL
  parentId?: mongoose.Types.ObjectId; // null if root
  linkedEntityId?: mongoose.Types.ObjectId; // e.g., CustomerId or LeadId
  linkedEntityType?: string; // e.g., 'Customer', 'Lead'
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["file", "folder"], required: true },
    size: { type: Number },
    mimeType: { type: String },
    fileUrl: { type: String },
    parentId: { type: Schema.Types.ObjectId, ref: "Document", default: null },
    linkedEntityId: { type: Schema.Types.ObjectId },
    linkedEntityType: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Doc: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

export default Doc;
