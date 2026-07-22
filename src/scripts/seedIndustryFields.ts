// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import DynamicField from "../modules/settings/schemas/DynamicField";
import Industry from "../modules/settings/schemas/Industry";

dotenv.config({ path: ".env.local" });

async function seedIndustryFields() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const realEstate = await Industry.findOne({ name: "Real Estate" });
    const healthcare = await Industry.findOne({ name: "Healthcare" });
    const webDev = await Industry.findOne({ name: "Web Development" });
    const edTech = await Industry.findOne({ name: "EdTech" });

    const fields = [];

    if (realEstate) {
      fields.push(
        {
          name: "Property Type",
          target: "lead",
          type: "select",
          required: false,
          tenantScope: "Industry",
          industryId: realEstate._id,
          options: ["Apartment", "House", "Commercial", "Land"],
          section: "Property Details",
          order: 1
        },
        {
          name: "MLS Number",
          target: "project",
          type: "text",
          required: false,
          tenantScope: "Industry",
          industryId: realEstate._id,
          section: "Listing Info",
          order: 1
        }
      );
    }

    if (healthcare) {
      fields.push(
        {
          name: "Insurance Provider",
          target: "customer",
          type: "text",
          required: false,
          tenantScope: "Industry",
          industryId: healthcare._id,
          section: "Medical Info",
          order: 1
        },
        {
          name: "Patient Priority",
          target: "lead",
          type: "select",
          required: true,
          tenantScope: "Industry",
          industryId: healthcare._id,
          options: ["Routine", "Urgent", "Emergency"],
          section: "Triage",
          order: 1
        }
      );
    }

    if (webDev) {
      fields.push(
        {
          name: "Tech Stack",
          target: "project",
          type: "select",
          required: false,
          tenantScope: "Industry",
          industryId: webDev._id,
          options: ["MERN", "Next.js", "Django", "Ruby on Rails", "WordPress"],
          section: "Technical Details",
          order: 1
        }
      );
    }

    if (edTech) {
        fields.push(
          {
            name: "Grade Level",
            target: "customer",
            type: "select",
            required: false,
            tenantScope: "Industry",
            industryId: edTech._id,
            options: ["K-12", "Undergraduate", "Graduate", "Professional"],
            section: "Academic Info",
            order: 1
          }
        );
      }

    for (const field of fields) {
      await DynamicField.findOneAndUpdate(
        { name: field.name, industryId: field.industryId },
        { $set: field },
        { upsert: true, new: true }
      );
      console.log(`Created Industry Field: ${field.name} for ${field.target}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding industry fields:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedIndustryFields();
