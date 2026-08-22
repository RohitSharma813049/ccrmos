const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crmos');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'info@webeside.in' });
  console.log("info@webeside.in:", user);
  process.exit(0);
}
run();
