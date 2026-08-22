const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crmos');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'owner@crmos.com' });
  console.log("owner@crmos.com:", user);
  const user2 = await db.collection('users').findOne({ email: 'rohitsharma813049@gmail.com' });
  console.log("rohitsharma813049@gmail.com:", user2);
  process.exit(0);
}
run();
