import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");
  
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const c of collections) {
      if (c.name.toLowerCase().includes('log') || c.name.toLowerCase().includes('audit')) {
        await mongoose.connection.db.collection(c.name).deleteMany({});
        console.log(`Cleared collection: ${c.name}`);
      }
    }
  }
  process.exit(0);
}
run();
