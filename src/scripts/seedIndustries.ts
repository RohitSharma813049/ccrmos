// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import Industry from "../modules/settings/schemas/Industry";

dotenv.config({ path: ".env.local" });

async function seedIndustries() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const industries = [
      {
        name: "Real Estate",
        description: "Property management, real estate agencies, and brokerages.",
        isActive: true
      },
      {
        name: "Web Development",
        description: "Software agencies, IT consulting, and freelance developers.",
        isActive: true
      },
      {
        name: "EdTech",
        description: "Educational platforms, tutoring centers, and online courses.",
        isActive: true
      },
      {
        name: "Healthcare",
        description: "Clinics, hospitals, and telemedicine providers.",
        isActive: true
      },
      {
        name: "Retail",
        description: "E-commerce and brick-and-mortar storefronts.",
        isActive: true
      }
    ];

    for (const ind of industries) {
      await Industry.findOneAndUpdate(
        { name: ind.name },
        { $set: ind },
        { upsert: true, new: true }
      );
      console.log(`Created Industry: ${ind.name}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding industries:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedIndustries();
