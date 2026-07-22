// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Company from "../modules/companies/schemas/Company";
import User from "../modules/users/schemas/User";
import CustomModule from "../modules/settings/schemas/CustomModule";
import Workflow from "../modules/automation/schemas/Workflow";

dotenv.config({ path: ".env.local" });

async function seedRealEstateExample() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    // 1. Create the Company
    console.log("Creating Real Estate Company...");
    const company: any = await Company.create({
      name: "Apex Real Estate",
      adminEmail: "john@apexrealestate.com",
      subscriptionStatus: "active"
    });

    // 2. Create the Founder User
    console.log("Creating Founder User...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const founder: any = await User.create({
      name: "John Realtor",
      email: "john@apexrealestate.com",
      password: hashedPassword,
      role: "Founder",
      hierarchyLevel: 2, 
      companyId: company._id,
      isActive: true
    });

    // 3. Create Custom Module: "Properties"
    console.log("Creating 'Properties' Custom Module...");
    const propertiesModule = await CustomModule.create({
      name: "Properties",
      active: true,
      companyId: company._id, 
      fields: [
        { name: "Property Name", type: "text", required: true },
        { name: "Location", type: "text", required: true },
        { name: "Price", type: "number", required: true },
        { name: "Status", type: "select", required: true, options: ["Available", "Under Offer", "Sold"] },
        { name: "Listing Date", type: "date", required: false }
      ]
    });

    // 4. Create a Custom Module: "Viewings"
    console.log("Creating 'Viewings' Custom Module...");
    await CustomModule.create({
      name: "Viewings",
      active: true,
      companyId: company._id,
      fields: [
        { name: "Client Name", type: "text", required: true },
        { name: "Property Interested In", type: "text", required: true },
        { name: "Viewing Date", type: "date", required: true },
        { name: "Feedback", type: "textarea", required: false }
      ]
    });

    // 5. Create a Workflow Automation for the Company
    console.log("Creating Workflow Pipeline...");
    const workflow = await Workflow.create({
      companyId: company._id,
      title: "Property Sold Celebration & Task",
      description: "When a property is sold, alert the team and create legal tasks.",
      active: true,
      trigger: "Property Updated", 
      conditions: [
        {
          field: "Status",
          operator: "equals",
          value: "Sold"
        }
      ],
      actions: [
        {
          type: "Create Task",
          payload: {
            title: "Prepare Legal Documents for Sold Property",
            description: "A property was just marked as Sold. Please prepare the transfer of deed."
          }
        },
        {
          type: "Send Email",
          payload: {
            to: "legal@apexrealestate.com",
            subject: "New Property Sold - Action Required"
          }
        }
      ]
    });

    console.log("\n--- SEED SUCCESSFUL ---");
    console.log(`Company: ${company.name}`);
    console.log(`Login Email: ${founder.email}`);
    console.log(`Password: password123`);
    console.log(`Created 2 Custom Modules specific to this company.`);
    console.log(`Created 1 Workflow pipeline.`);
    
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedRealEstateExample();
