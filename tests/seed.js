require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await mongoose.connection.collection('users').updateOne(
    { email: 'owner@crmos.com' },
    { 
      $set: { 
        email: 'owner@crmos.com', 
        hierarchyLevel: 1, 
        role: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } 
    },
    { upsert: true }
  );
  
  console.log('Test user created in live database!');
  process.exit(0);
}

seed();
