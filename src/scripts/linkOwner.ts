import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import Company from "../modules/companies/schemas/Company";
import User from "../modules/users/schemas/User";

async function linkOwnerToCompany() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  try {
    // 1. Rename Acme Corp to CRMD
    let company = await Company.findOne({ name: "Acme Corp" });
    if (company) {
      company.name = "CRMD";
      await company.save();
      console.log("Renamed test company to CRMD");
    } else {
      company = await Company.findOne({ name: "CRMD" });
    }

    if (!company) {
      console.log("Could not find the test company.");
      process.exit(1);
    }

    // 2. Link the Platform Owner to the CRMD company
    const ownerEmail = "owner@crmos.com";
    await User.findOneAndUpdate(
      { email: ownerEmail },
      { companyId: company._id },
      { new: true }
    );

    console.log(`Successfully linked ${ownerEmail} to company CRMD!`);
  } catch (error) {
    console.error("Error linking owner to company:", error);
  } finally {
    process.exit(0);
  }
}

linkOwnerToCompany();
