require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const user of users) {
    console.log("Remote User:", user.email, user.role);
  }
  process.exit(0);
});
