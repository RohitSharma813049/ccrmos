import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote extends Document {
  companyId: mongoose.Types.ObjectId;
  recordId: mongoose.Types.ObjectId;
  recordModel: string; // e.g. "Customer", "Lead", "Project"
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema<INote> = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    recordId: { type: Schema.Types.ObjectId, required: true },
    recordModel: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexing for faster retrieval by record
NoteSchema.index({ companyId: 1, recordModel: 1, recordId: 1 });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;
