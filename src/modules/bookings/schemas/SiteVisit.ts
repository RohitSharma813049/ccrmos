import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteVisit extends Document {
  companyId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  dateTime: Date;
  durationMinutes: number;
  status: "Scheduled" | "Completed" | "No-Show" | "Cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteVisitSchema: Schema<ISiteVisit> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dateTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  status: { 
    type: String, 
    enum: ["Scheduled", "Completed", "No-Show", "Cancelled"],
    default: "Scheduled" 
  },
  notes: { type: String }
}, { timestamps: true });

const SiteVisit: Model<ISiteVisit> = mongoose.models.SiteVisit || mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);

export default SiteVisit;
