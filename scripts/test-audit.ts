import { config } from 'dotenv';
config();
import dbConnect from '../src/lib/db';
import { logActivity } from '../src/modules/audit/services/audit.service';
import mongoose from 'mongoose';

async function run() {
  await dbConnect();
  console.log("Connected to DB");
  
  try {
    await logActivity({
      companyId: "6a6094d089ecd4b0e7889fdf",
      userId: "6a6094d189ecd4b0e7889fe0",
      module: "System",
      recordId: "SYSTEM-001",
      action: "System Boot"
    });
    console.log("Activity logged successfully!");
  } catch (err) {
    console.error("Error logging activity:", err);
  } finally {
    mongoose.disconnect();
  }
}

run();
