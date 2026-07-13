import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import User from "../modules/users/schemas/User";

async function upgradeToOwner() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for Owner Upgrade!");

  try {
    const emailToUpgrade = "ss6019243@gmail.com"; // Corrected email
    
    let user = await User.findOne({ email: emailToUpgrade });

    if (user) {
      user.hierarchyLevel = 1;
      await user.save();
      console.log(`Successfully upgraded ${emailToUpgrade} to Platform Owner (hierarchyLevel: 1)!`);
    } else {
      console.log(`User with email ${emailToUpgrade} not found.`);
    }

  } catch (error) {
    console.error("Error upgrading owner:", error);
  } finally {
    process.exit(0);
  }
}

upgradeToOwner();
