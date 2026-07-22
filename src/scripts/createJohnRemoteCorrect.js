require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const existingFounder = await db.collection('users').findOne({ email: 'ss6019243@gmail.com' });

  if (existingFounder) {
    await db.collection('users').updateOne(
      { email: 'john@apexrealestate.com' },
      {
        $set: {
          email: 'john@apexrealestate.com',
          name: 'John Apex',
          companyId: existingFounder.companyId,
          founderId: existingFounder._id,
          role: existingFounder.role,
          hierarchyLevel: 2, 
          permissions: existingFounder.permissions,
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );
    console.log("Created john@apexrealestate.com on remote DB using ss6019243@gmail.com!");
  } else {
    console.log("Could not find existing founder ss6019243@gmail.com.");
  }
  process.exit(0);
});
