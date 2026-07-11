require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.collection('users').find({ email: /@crmos.com/ }).toArray();
  console.log("Users found in DB:");
  console.log(users.map(u => ({ email: u.email, id: u._id, companyId: u.companyId })));
  process.exit(0);
}
check();
