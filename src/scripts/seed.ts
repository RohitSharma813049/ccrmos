import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const userSchema = new mongoose.Schema({
  email: String,
  hierarchyLevel: Number,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB!");

  // Change this to whatever email you want to use
  const ownerEmail = "owner@crmos.com";

  await User.findOneAndUpdate(
    { email: ownerEmail },
    { email: ownerEmail, hierarchyLevel: 1, role: "owner" },
    { upsert: true, new: true }
  );

  console.log(`Successfully seeded Platform Owner: ${ownerEmail}`);
  process.exit(0);
}

seed();
