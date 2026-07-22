const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/crmos').then(async () => {
  const db = mongoose.connection.db;
  const roles = await db.collection('roles').find({}).toArray();
  for (const role of roles) {
    console.log("Role ID:", role._id, "| Name:", role.name, "| Permissions:", role.permissions);
  }
  process.exit(0);
});
