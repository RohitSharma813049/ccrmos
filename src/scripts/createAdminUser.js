const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/crmos').then(async () => {
  const db = mongoose.connection.db;

  // Find existing founder to copy company ID and role
  const existingFounder = await db.collection('users').findOne({ email: 'webesideclient@gmail.com' });

  if (existingFounder) {
    // Create the admin@cityhospital.com user
    await db.collection('users').updateOne(
      { email: 'admin@cityhospital.com' },
      {
        $set: {
          email: 'admin@cityhospital.com',
          name: 'City Hospital Admin',
          companyId: existingFounder.companyId,
          founderId: existingFounder._id,
          role: existingFounder.role,
          hierarchyLevel: 2, // Founder level
          permissions: existingFounder.permissions,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );
    console.log("Created admin@cityhospital.com successfully!");
  } else {
    console.log("Could not find existing founder to link company.");
  }
  process.exit(0);
});
