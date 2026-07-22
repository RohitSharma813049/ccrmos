// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import DynamicField from "../modules/settings/schemas/DynamicField";
import Industry from "../modules/settings/schemas/Industry";

dotenv.config({ path: ".env.local" });

async function seedMoreIndustryFields() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const industries = await Industry.find({});
    const industryMap = {};
    for (const ind of industries) {
      industryMap[ind.name] = ind._id;
    }

    const fields = [];

    // REAL ESTATE
    if (industryMap["Real Estate"]) {
      fields.push(
        { name: "Property Type", target: "lead", type: "select", options: ["Apartment", "House", "Commercial", "Land"], section: "Property Details", industryId: industryMap["Real Estate"] },
        { name: "Budget Range", target: "lead", type: "select", options: ["Under $100k", "$100k - $500k", "$500k - $1M", "$1M+"], section: "Property Details", industryId: industryMap["Real Estate"] },
        { name: "MLS Number", target: "project", type: "text", section: "Listing Info", industryId: industryMap["Real Estate"] },
        { name: "Year Built", target: "project", type: "number", section: "Listing Info", industryId: industryMap["Real Estate"] },
        { name: "HOA Fees", target: "invoice", type: "number", section: "Property Costs", industryId: industryMap["Real Estate"] }
      );
    }

    // HEALTHCARE
    if (industryMap["Healthcare"]) {
      fields.push(
        { name: "Insurance Provider", target: "customer", type: "text", section: "Medical Info", industryId: industryMap["Healthcare"] },
        { name: "Policy Number", target: "customer", type: "text", section: "Medical Info", industryId: industryMap["Healthcare"] },
        { name: "Patient Priority", target: "lead", type: "select", options: ["Routine", "Urgent", "Emergency"], section: "Triage", industryId: industryMap["Healthcare"] },
        { name: "Symptoms", target: "lead", type: "textarea", section: "Triage", industryId: industryMap["Healthcare"] },
        { name: "Co-Pay Amount", target: "invoice", type: "number", section: "Billing", industryId: industryMap["Healthcare"] }
      );
    }

    // WEB DEVELOPMENT
    if (industryMap["Web Development"]) {
      fields.push(
        { name: "Tech Stack", target: "project", type: "select", options: ["MERN", "Next.js", "Django", "Ruby on Rails", "WordPress"], section: "Technical Details", industryId: industryMap["Web Development"] },
        { name: "GitHub Repo", target: "project", type: "url", section: "Technical Details", industryId: industryMap["Web Development"] },
        { name: "Hosting Provider", target: "customer", type: "select", options: ["AWS", "Vercel", "DigitalOcean", "Azure", "GCP"], section: "Infrastructure", industryId: industryMap["Web Development"] },
        { name: "Design Assets Link", target: "task", type: "url", section: "Resources", industryId: industryMap["Web Development"] },
        { name: "Retainer Hours", target: "invoice", type: "number", section: "Contract", industryId: industryMap["Web Development"] }
      );
    }

    // EDTECH
    if (industryMap["EdTech"]) {
      fields.push(
        { name: "Grade Level", target: "customer", type: "select", options: ["K-12", "Undergraduate", "Graduate", "Professional"], section: "Academic Info", industryId: industryMap["EdTech"] },
        { name: "Major / Subject", target: "customer", type: "text", section: "Academic Info", industryId: industryMap["EdTech"] },
        { name: "Enrollment Status", target: "lead", type: "select", options: ["Prospective", "Enrolled", "Graduated", "Dropped"], section: "Status", industryId: industryMap["EdTech"] },
        { name: "Course ID", target: "project", type: "text", section: "Curriculum", industryId: industryMap["EdTech"] },
        { name: "Tuition Fees", target: "invoice", type: "number", section: "Financial Aid", industryId: industryMap["EdTech"] }
      );
    }

    // RETAIL
    if (industryMap["Retail"]) {
      fields.push(
        { name: "Store Location", target: "customer", type: "text", section: "Demographics", industryId: industryMap["Retail"] },
        { name: "Loyalty Tier", target: "customer", type: "select", options: ["Bronze", "Silver", "Gold", "Platinum"], section: "Rewards", industryId: industryMap["Retail"] },
        { name: "SKU", target: "order", type: "text", section: "Inventory", industryId: industryMap["Retail"] },
        { name: "Return Reason", target: "task", type: "select", options: ["Defective", "Wrong Size", "Not Needed", "Other"], section: "Customer Support", industryId: industryMap["Retail"] },
        { name: "Discount Code Applied", target: "invoice", type: "text", section: "Billing", industryId: industryMap["Retail"] }
      );
    }

    for (const field of fields) {
      await DynamicField.findOneAndUpdate(
        { name: field.name, industryId: field.industryId },
        { 
          $set: {
            ...field,
            tenantScope: "Industry",
            required: false,
            order: 1
          }
        },
        { upsert: true, new: true }
      );
      console.log(`Created Industry Field: ${field.name}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding industry fields:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedMoreIndustryFields();
