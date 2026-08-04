const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  modules: Array,
}, { timestamps: true });

const industrySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

const Industry = mongoose.models.Industry || mongoose.model("Industry", industrySchema);
const IndustryTemplate = mongoose.models.IndustryTemplate || mongoose.model("IndustryTemplate", templateSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    let realEstateInd = await Industry.findOne({ name: "Real Estate" });
    if (!realEstateInd) realEstateInd = await Industry.create({ name: "Real Estate" });
    
    let healthInd = await Industry.findOne({ name: "Healthcare" });
    if (!healthInd) healthInd = await Industry.create({ name: "Healthcare" });
    
    let techInd = await Industry.findOne({ name: "Technology / SaaS" });
    if (!techInd) techInd = await Industry.create({ name: "Technology / SaaS" });

    const templates = [
      {
        name: "Real Estate CRM",
        description: "Pre-configured modules for Properties, Listings, and Buyers.",
        industry_id: realEstateInd._id,
        is_default: true,
        modules: [],
        fields: []
      },
      {
        name: "Healthcare CRM",
        description: "Includes Patient Management, Appointments, and Medical Records.",
        industry_id: healthInd._id,
        is_default: true,
        modules: [],
        fields: []
      },
      {
        name: "B2B SaaS Sales",
        description: "Standard CRM with Accounts, Opportunities, and ARR tracking.",
        industry_id: techInd._id,
        is_default: true,
        modules: [],
        fields: []
      }
    ];

    await IndustryTemplate.deleteMany({});
    await IndustryTemplate.insertMany(templates);
    console.log("Successfully seeded Industry Templates!");
  } catch (error) {
    console.error("Error seeding templates:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
