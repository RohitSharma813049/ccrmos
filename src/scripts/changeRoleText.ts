import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "../modules/users/schemas/User";

dotenv.config({ path: ".env.local" });

async function changeRoleText() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  try {
    const emailToUpdate = "ss6019243@gmail.com";
    let user = await User.findOne({ email: emailToUpdate });

    if (user) {
      user.role = new mongoose.Types.ObjectId('6a50ebf69c4706973ed76e92');
      await user.save();
      console.log(`Successfully updated ${emailToUpdate} text role to "owner"!`);
    } else {
      console.log(`User with email ${emailToUpdate} not found.`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

changeRoleText();
