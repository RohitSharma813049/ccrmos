import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedView extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  module: "Leads" | "Properties" | "Users" | "Invoices";
  filters: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedViewSchema: Schema<ISavedView> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  module: { 
    type: String, 
    enum: ["Leads", "Properties", "Users", "Invoices"], 
    required: true 
  },
  filters: { type: Schema.Types.Mixed, default: {} },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

SavedViewSchema.index({ companyId: 1, userId: 1, module: 1 });

const SavedView: Model<ISavedView> = mongoose.models.SavedView || mongoose.model<ISavedView>("SavedView", SavedViewSchema);

export default SavedView;
