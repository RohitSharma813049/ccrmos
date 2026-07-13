import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import User from "../modules/users/schemas/User";

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const users = await User.find({}, 'email hierarchyLevel role').lean();
  console.log("Users in DB:");
  console.log(users);
  process.exit(0);
}

listUsers();
