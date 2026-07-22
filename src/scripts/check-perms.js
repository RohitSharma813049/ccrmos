const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/crmos').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const user of users) {
    console.log(user.email, "| Hierarchy:", user.hierarchyLevel, "| Role:", user.role, "| Perms:", user.permissions);
  }
  process.exit(0);
});
