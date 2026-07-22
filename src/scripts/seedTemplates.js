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

const IndustryTemplate = mongoose.models.IndustryTemplate || mongoose.model("IndustryTemplate", templateSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const templates = [
      {
        name: "Real Estate CRM",
        description: "Pre-configured modules for Properties, Listings, and Buyers.",
        modules: []
      },
      {
        name: "Healthcare CRM",
        description: "Includes Patient Management, Appointments, and Medical Records.",
        modules: []
      },
      {
        name: "B2B SaaS Sales",
        description: "Standard CRM with Accounts, Opportunities, and ARR tracking.",
        modules: []
      }
    ];

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
