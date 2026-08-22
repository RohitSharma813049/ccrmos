const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crmos');
  const db = mongoose.connection.db;
  const company = await db.collection('companies').findOne({ adminEmail: 'info@webeside.in' });
  console.log("Company:", company);
  const companyById = await db.collection('companies').findOne({ _id: new mongoose.Types.ObjectId('6a75c601be6239d48c7c5ffd') }); // rohit's company
  console.log("Rohit's Company:", companyById);
  process.exit(0);
}
run();
