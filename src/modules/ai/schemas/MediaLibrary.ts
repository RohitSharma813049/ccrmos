import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMediaLibrary extends Document {
  name: string;
  type: string;
  url: string;
  companyId: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaLibrarySchema: Schema<IMediaLibrary> = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  founderId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const MediaLibrary: Model<IMediaLibrary> = mongoose.models.MediaLibrary || mongoose.model<IMediaLibrary>("MediaLibrary", MediaLibrarySchema);

export default MediaLibrary;
