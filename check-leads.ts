import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to MongoDB');
  
  const users = await mongoose.connection.collection('users').find({ email: { $regex: 'founder-core2' } }).toArray();
  console.log('Found users:', users);

  const companies = await mongoose.connection.collection('companies').find({ name: { $regex: 'Acme Core2' } }).toArray();
  console.log('Found companies:', companies);
  
  process.exit(0);
}

check();
