import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import Company from "../modules/companies/schemas/Company";
import Role from "../modules/roles/schemas/Role";
import User from "../modules/users/schemas/User";

async function fixOwner() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for Owner Fix!");

  try {
    // 1. Find the CRMD company
    let company = await Company.findOne({ name: "CRMD" });
    if (!company) {
      // Fallback if they didn't rename it
      company = await Company.findOne({ name: "Acme Corp" });
    }

    if (!company) {
      console.log("Could not find the test company. Exiting.");
      process.exit(1);
    }

    // 2. Ensure an 'owner' role exists for this company
    let ownerRole = await Role.findOne({ name: "owner", companyId: company._id });
    if (!ownerRole) {
      ownerRole = await Role.create({
        name: "owner",
        companyId: company._id,
        permissions: {} as any,
      });
      console.log("Created valid 'owner' Role document.");
    }

    // 3. Fix the owner@crmos.com user
    const ownerEmail = "owner@crmos.com";
    let ownerUser = await User.findOne({ email: ownerEmail });

    if (ownerUser) {
      ownerUser.companyId = company._id;
      ownerUser.hierarchyLevel = 1;
      ownerUser.role = ownerRole._id; // Properly link the ObjectId
      await ownerUser.save();
      console.log(`Successfully fixed ${ownerEmail} and linked to CRMD!`);
    } else {
      console.log("owner@crmos.com not found. Creating...");
      await User.create({
        email: ownerEmail,
        companyId: company._id,
        hierarchyLevel: 1,
        role: ownerRole._id,
        isActive: true
      });
      console.log("Created owner@crmos.com");
    }

  } catch (error) {
    console.error("Error fixing owner:", error);
  } finally {
    process.exit(0);
  }
}

fixOwner();
