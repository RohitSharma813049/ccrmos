const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://webesideclient_db_user:jRKVp1F6M0bmaUS3@ac-dn8bz9t-shard-00-00.0qbmn57.mongodb.net:27017,ac-dn8bz9t-shard-00-01.0qbmn57.mongodb.net:27017,ac-dn8bz9t-shard-00-02.0qbmn57.mongodb.net:27017/crmos?ssl=true&replicaSet=atlas-1i116o-shard-0&authSource=admin&retryWrites=true&w=majority');
  const companyId = new mongoose.Types.ObjectId('6a60ab7deef5983f87444257');
  const user = await mongoose.connection.collection('users').findOne({ companyId: companyId });
  const targetFounderId = user ? (user.founderId || user._id) : companyId;
  
  await mongoose.connection.collection('agents').updateMany({}, { $set: { founderId: targetFounderId } });
  console.log('Updated agents with founderId:', targetFounderId);
  process.exit(0);
}

fix();
