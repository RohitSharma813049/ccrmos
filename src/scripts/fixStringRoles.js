const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

async function fixStringRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    
    // Find users with string roles
    const users = await db.collection('users').find({ role: { $type: 'string' } }).toArray();
    console.log(`Found ${users.length} users with a string role.`);

    for (const u of users) {
      console.log(`Fixing user ${u.email} (current role: ${u.role})`);
      
      // We will unset the string 'role' field because it violates the ObjectId schema
      // We can preserve the string in another field like 'roleName' if needed, 
      // but 'hierarchyLevel' is what the app actually uses for authorization.
      await db.collection('users').updateOne(
        { _id: u._id },
        { $unset: { role: "" }, $set: { legacyRole: u.role } }
      );
    }
    
    console.log("Successfully fixed all users!");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixStringRoles();
