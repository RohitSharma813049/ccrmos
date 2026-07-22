const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const industrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Industry = mongoose.models.Industry || mongoose.model("Industry", industrySchema);

const industriesToAdd = [
  { name: "Real Estate", description: "Real estate agencies, property management" },
  { name: "EdTech", description: "Educational technology companies" },
  { name: "Healthcare", description: "Hospitals, clinics, medical devices" },
  { name: "Financial Services", description: "Banking, insurance, wealth management" },
  { name: "Manufacturing", description: "Industrial manufacturing and production" },
  { name: "Retail & E-commerce", description: "Online and brick-and-mortar stores" },
  { name: "Software & IT Services", description: "SaaS, custom software, IT consulting" },
  { name: "Consulting & Professional Services", description: "Management, HR, strategy consulting" },
  { name: "Construction", description: "Commercial and residential construction" },
  { name: "Hospitality & Tourism", description: "Hotels, travel agencies, restaurants" },
  { name: "Logistics & Transportation", description: "Shipping, freight, supply chain" },
  { name: "Telecommunications", description: "Internet providers, mobile carriers" },
  { name: "Marketing & Advertising", description: "Ad agencies, digital marketing" },
  { name: "Legal Services", description: "Law firms, legal consulting" },
  { name: "Automotive", description: "Car dealerships, automotive manufacturing" }
];

async function seedIndustries() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const data of industriesToAdd) {
      await Industry.findOneAndUpdate(
        { name: data.name },
        { $set: data },
        { upsert: true, new: true }
      );
    }
    
    const count = await Industry.countDocuments();
    console.log(`Successfully seeded industries. Total industries: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding industries:", error);
    process.exit(1);
  }
}

seedIndustries();
