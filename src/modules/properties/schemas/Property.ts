import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProperty extends Document {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  priceDesc?: string;
  location: string;
  geo?: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  area?: string;
  units?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  status: "Available" | "Sold" | "Rented" | "Off-Market";
  type: "House" | "Apartment" | "Condo" | "Land" | "Commercial" | "Farm Land";
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  images?: string[];
  documents?: { url: string; name: string; format: string }[];
  
  // AI Vector Search
  embedding?: number[];
  
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema<IProperty> = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  priceDesc: { type: String },
  location: { type: String, required: true },
  geo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  area: { type: String },
  units: { type: String },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  squareFeet: { type: Number },
  status: { 
    type: String, 
    enum: ["Available", "Sold", "Rented", "Off-Market"], 
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
  images: [{ type: String }],
  documents: [{
    url: String,
    name: String,
    format: String
  }],
  
  embedding: { type: [Number] }
}, { timestamps: true });

PropertySchema.index({ geo: "2dsphere" });

const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);

export default Property;
