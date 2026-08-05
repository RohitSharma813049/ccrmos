import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description?: string;
  price?: string;
  priceDesc?: string;
  location?: string;
  area?: string;
  units?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  status: "Available" | "Sold" | "Pending" | "Off-Market";
  type: "House" | "Apartment" | "Condo" | "Land" | "Commercial" | "Farm Land";
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema<IProperty> = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: String },
  priceDesc: { type: String },
  location: { type: String },
  area: { type: String },
  units: { type: String },
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
    enum: ["House", "Apartment", "Condo", "Land", "Commercial", "Farm Land"],
    default: "House"
  },
  companyId: { type: Schema.Types.ObjectId, ref: "Company" },
  founderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  images: [{ type: String }]
}, { timestamps: true });

const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
