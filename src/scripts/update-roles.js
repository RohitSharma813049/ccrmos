const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/crmos').then(async () => {
  const db = mongoose.connection.db;
  // Add AUDIT_MANAGEMENT to any role that has VIEW_ALL_COMPANY_LEADS (which identifies the founder/admin role)
  // Or just add it where name is 'founder' or 'admin' or 'owner' (if hierarchyLevel=2)
  const result = await db.collection('roles').updateMany(
    { name: { $in: ['founder', 'owner', 'admin'] } },
    { $addToSet: { permissions: 'AUDIT_MANAGEMENT' } }
  );
  console.log(`Modified ${result.modifiedCount} roles.`);
  process.exit(0);
});
