import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Role from "../modules/roles/schemas/Role";

dotenv.config({ path: ".env.local" });

async function checkRoles() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  try {
    const roles = await Role.find({});
    console.log(roles.map(r => ({ id: r._id, name: r.name })));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkRoles();
