import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Industry from '../modules/settings/schemas/Industry';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const industries = await Industry.find({ isActive: true }).sort({ name: 1 });
    console.log(JSON.stringify(industries, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
run();
