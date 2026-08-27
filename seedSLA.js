const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ModuleStatus = mongoose.models.ModuleStatus || mongoose.model('ModuleStatus', new mongoose.Schema({}, {strict:false}));
  const Lead = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}, {strict:false}));

  // Create a fake company ID or use an existing one
  const companyId = new mongoose.Types.ObjectId("60d5ecb54ab7358111623456");

  // Create a test SLA status
  const slaStatus = await ModuleStatus.create({
    companyId,
    moduleName: "Leads",
    type: "status",
    name: "Test SLA Status",
    slaHours: 24,
    autoNotifyBeforeHours: 2
  });
  console.log("Created SLA Status:", slaStatus.name);

  // Set the updatedAt to 23 hours ago so it breaches the warning threshold (24 - 2 = 22 hours)
  const pastDate = new Date();
  pastDate.setHours(pastDate.getHours() - 23);

  // Assign a test lead to this status
  const lead = await Lead.create({
    companyId,
    firstName: "SLA",
    lastName: "TestLead",
    email: "sla@test.com",
    status: slaStatus.name,
    assignedUserId: new mongoose.Types.ObjectId("64d5ecb54ab7358111623456") // Fake user ID
  });

  // Force update the updatedAt field to bypass mongoose timestamps
  await Lead.updateOne({_id: lead._id}, {$set: {updatedAt: pastDate}});
  console.log("Created SLA Lead:", lead._id);

  process.exit(0);
});
