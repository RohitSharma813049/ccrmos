import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import dbConnect from "../src/lib/db";
import CustomRecord from "../src/modules/settings/schemas/CustomRecord";
import CustomModule from "../src/modules/settings/schemas/CustomModule";
import Company from "../src/modules/companies/schemas/Company";

async function run() {
  try {
    await dbConnect();
    
    // Find the company
    const company = await Company.findOne();
    if (!company) throw new Error("No company");
    const effectiveCompanyId = company._id.toString(); // STRING!

    const moduleDoc = await CustomModule.create({
      companyId: company._id,
      name: "Not",
      active: true,
      fields: [{ name: "like", type: "text", required: true }]
    });
    
    const moduleId = moduleDoc._id.toString(); // STRING!

    const body = { data: { "like": "me" } };

    const newRecord = await CustomRecord.create({
      moduleId,
      companyId: effectiveCompanyId,
      data: body.data || {}
    });

    console.log("Success string cast:", newRecord);
  } catch (error) {
    console.error("Exception occurred:", error);
  } finally {
    process.exit(0);
  }
}

run();
