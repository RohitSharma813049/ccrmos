import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const founderId = new mongoose.Types.ObjectId('6a50e4d0550c8b686f11729a');
  const companyId = new mongoose.Types.ObjectId('6a50e4a6a332999e0ed112e0');
  
  await db.collection('users').updateMany({ companyId: companyId, hierarchyLevel: { $gte: 2 } }, { $set: { founderId } });
  await db.collection('leads').updateMany({}, { $set: { founderId } });
  await db.collection('customers').updateMany({}, { $set: { founderId } });
  await db.collection('projects').updateMany({}, { $set: { founderId } });
  await db.collection('invoices').updateMany({}, { $set: { founderId } });
  await db.collection('tasks').updateMany({}, { $set: { founderId } });
  await db.collection('counters').updateMany({}, { $set: { founderId } });
  
  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(console.error);
