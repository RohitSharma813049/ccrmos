const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ModuleStatus = mongoose.models.ModuleStatus || mongoose.model('ModuleStatus', new mongoose.Schema({}, {strict:false}));
  const Lead = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}, {strict:false}));

  const fakeCompanyId = new mongoose.Types.ObjectId("60d5ecb54ab7358111623456");
  const realCompanyId = new mongoose.Types.ObjectId("6a75c601be6239d48c7c5ffd");
  const fakeUserId = new mongoose.Types.ObjectId("64d5ecb54ab7358111623456");

  await ModuleStatus.updateMany({ companyId: fakeCompanyId }, { $set: { companyId: realCompanyId } });
  await Lead.updateMany({ companyId: fakeCompanyId }, { $set: { companyId: realCompanyId, assignedUserId: fakeUserId } });

  console.log("Updated data to use real company ID.");
  process.exit(0);
});
