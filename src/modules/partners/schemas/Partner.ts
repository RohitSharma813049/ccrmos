import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPartner extends Document {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  alternateMobile?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  type: "Company" | "Individual" | "Firm" | "Agency";
  experience?: string;
  focusedProject?: string;
  preferredLocations?: string;
  teamSize?: string;
  userId?: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema: Schema<IPartner> = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  alternateMobile: { type: String },
  whatsapp: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  type: { 
    type: String, 
    enum: ["Company", "Individual", "Firm", "Agency"],
    default: "Individual"
  },
  experience: { type: String },
  focusedProject: { type: String },
  preferredLocations: { type: String },
  teamSize: { type: String, default: "0" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Partner: Model<IPartner> = mongoose.models.Partner || mongoose.model<IPartner>("Partner", PartnerSchema);

export default Partner;
