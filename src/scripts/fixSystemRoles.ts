import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import Role from "../modules/roles/schemas/Role";

async function fixSystemRoles() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for System Roles Fix!");

  const standardRoles = ["owner", "founder", "director", "manager", "team_leader", "employee"];

  try {
    const result = await Role.updateMany(
      { name: { $in: standardRoles } },
      { $set: { isSystem: true } }
    );
    console.log(`Updated ${result.modifiedCount} roles to be system roles.`);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fixSystemRoles();
