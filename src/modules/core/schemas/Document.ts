import mongoose, { Schema, Document as MongooseDocument, Model } from "mongoose";

export interface IDocument extends MongooseDocument {
  companyId: mongoose.Types.ObjectId;
  name: string;
  url: string; // S3 link or similar
  documentType: "Contract" | "Identity" | "Blueprint" | "Invoice" | "Other";
  
  // Polymorphic association
  relatedToModel: "Lead" | "Property" | "User" | "Company";
  relatedToId: mongoose.Types.ObjectId;

  // E-Signature tracking
  signatureStatus: "Not Required" | "Pending" | "Signed" | "Rejected";
  signedAt?: Date;
  signedBy?: string; // IP address or identifier

  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  documentType: { 
    type: String, 
    enum: ["Contract", "Identity", "Blueprint", "Invoice", "Other"],
    default: "Other" 
  },
  
  relatedToModel: { 
    type: String, 
    enum: ["Lead", "Property", "User", "Company"],
    required: true 
  },
  relatedToId: { 
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'relatedToModel'
  },

  signatureStatus: { 
    type: String, 
    enum: ["Not Required", "Pending", "Signed", "Rejected"],
    default: "Not Required" 
  },
  signedAt: { type: Date },
  signedBy: { type: String },

  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// Create indexes for fast lookups by relation
DocumentSchema.index({ companyId: 1, relatedToModel: 1, relatedToId: 1 });

const DocumentModel: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
