import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description?: string;
  price?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  status: "Available" | "Sold" | "Pending" | "Off-Market";
  type: "House" | "Apartment" | "Condo" | "Land" | "Commercial";
  companyId?: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema<IProperty> = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  location: { type: String },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  squareFeet: { type: Number },
  status: { 
    type: String, 
    enum: ["Available", "Sold", "Pending", "Off-Market"], 
    default: "Available" 
  },
  type: { 
    type: String, 
    enum: ["House", "Apartment", "Condo", "Land", "Commercial"],
    default: "House"
  },
  companyId: { type: Schema.Types.ObjectId, ref: "Company" },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
  images: [{ type: String }]
}, { timestamps: true });

const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
