// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import DynamicField from "../modules/settings/schemas/DynamicField";

dotenv.config({ path: ".env.local" });

async function seedDynamicFields() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const fields = [
      {
        name: "Lead Source",
        target: "lead",
        type: "select",
        required: true,
        tenantScope: "Global",
        options: ["Website", "Referral", "Conference", "Cold Call", "Social Media"],
        section: "Marketing Data",
        order: 1
      },
      {
        name: "Budget Expectations",
        target: "lead",
        type: "number",
        required: false,
        tenantScope: "Global",
        section: "Qualification",
        order: 2
      },
      {
        name: "Timeline",
        target: "lead",
        type: "select",
        required: false,
        tenantScope: "Global",
        options: ["Immediate", "1-3 Months", "3-6 Months", "Next Year"],
        section: "Qualification",
        order: 3
      },
      {
        name: "LinkedIn Profile",
        target: "lead",
        type: "url",
        required: false,
        tenantScope: "Global",
        section: "General",
        order: 4
      },
      // Customer Fields
      {
        name: "Account Manager",
        target: "customer",
        type: "text",
        required: false,
        tenantScope: "Global",
        section: "Management",
        order: 1
      },
      {
        name: "Industry Type",
        target: "customer",
        type: "select",
        required: false,
        tenantScope: "Global",
        options: ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing"],
        section: "General",
        order: 2
      },
      // Project Fields
      {
        name: "Project Priority",
        target: "project",
        type: "select",
        required: true,
        tenantScope: "Global",
        options: ["Low", "Medium", "High", "Critical"],
        section: "Details",
        order: 1
      },
      {
        name: "Completion Date",
        target: "project",
        type: "date",
        required: false,
        tenantScope: "Global",
        section: "Timeline",
        order: 2
      },
      // Invoice Fields
      {
        name: "Payment Terms",
        target: "invoice",
        type: "select",
        required: true,
        tenantScope: "Global",
        options: ["Net 15", "Net 30", "Net 60", "Due on Receipt"],
        section: "Billing",
        order: 1
      },
      {
        name: "PO Number",
        target: "invoice",
        type: "text",
        required: false,
        tenantScope: "Global",
        section: "Billing",
        order: 2
      },
      // Task Fields
      {
        name: "Estimated Hours",
        target: "task",
        type: "number",
        required: false,
        tenantScope: "Global",
        section: "Planning",
        order: 1
      },
      {
        name: "Blockers",
        target: "task",
        type: "textarea",
        required: false,
        tenantScope: "Global",
        section: "Status",
        order: 2
      },
      // Order Fields
      {
        name: "Shipping Method",
        target: "order",
        type: "select",
        required: false,
        tenantScope: "Global",
        options: ["Standard", "Expedited", "Overnight", "Digital Delivery"],
        section: "Fulfillment",
        order: 1
      },
      {
        name: "Tracking Number",
        target: "order",
        type: "text",
        required: false,
        tenantScope: "Global",
        section: "Fulfillment",
        order: 2
      }
    ];

    for (const field of fields) {
      await DynamicField.findOneAndUpdate(
        { name: field.name, target: field.target },
        { $set: field },
        { upsert: true, new: true }
      );
      console.log(`Created Global Dynamic Field: ${field.name} for ${field.target}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding dynamic fields:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDynamicFields();
