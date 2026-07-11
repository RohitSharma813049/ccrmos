require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function seedE2E() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = mongoose.connection.collection('users');
  const companies = mongoose.connection.collection('companies');
  const permissions = mongoose.connection.collection('permissions');

  // Create companies
  const companyA = new mongoose.Types.ObjectId();
  const companyB = new mongoose.Types.ObjectId();

  const testCompanies = [
    { _id: companyA, name: 'E2E Company A' },
    { _id: companyB, name: 'E2E Company B' }
  ];

  for (const c of testCompanies) {
    const { _id, ...updateData } = c;
    await companies.updateOne(
      { name: c.name },
      { $set: updateData, $setOnInsert: { _id: c._id } },
      { upsert: true }
    );
  }

  // Set up users
  const founderAId = new mongoose.Types.ObjectId();
  const founderBId = new mongoose.Types.ObjectId();
  const memberAId = new mongoose.Types.ObjectId();

  const testUsers = [
    { _id: founderAId, email: 'foundera@crmos.com', name: 'Founder A', hierarchyLevel: 2, companyId: companyA },
    { _id: memberAId, email: 'membera@crmos.com', name: 'Member A', hierarchyLevel: 6, companyId: companyA, founderId: founderAId },
    { _id: founderBId, email: 'founderb@crmos.com', name: 'Founder B', hierarchyLevel: 2, companyId: companyB }
  ];

  for (const u of testUsers) {
    const { _id, ...updateData } = u;
    await users.updateOne(
      { email: u.email },
      { $set: updateData, $setOnInsert: { _id: u._id } },
      { upsert: true }
    );
  }

  const memberRole = new mongoose.Types.ObjectId();
  await mongoose.connection.collection('roles').updateOne(
    { _id: memberRole },
    { $set: {
      name: 'E2E Member Role',
      companyId: companyA,
      permissions: {
        Leads: { view: true, create: true, edit: true, delete: false, recordScope: 'Company' },
        Customers: { view: false, create: false, edit: false, delete: false, recordScope: 'Own' }
      }
    }},
    { upsert: true }
  );

  await users.updateOne(
    { email: 'membera@crmos.com' },
    { $set: { role: memberRole } }
  );

  console.log('E2E seed data created in live database!');
  process.exit(0);
}

seedE2E().catch(console.error);
