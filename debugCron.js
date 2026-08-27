const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ModuleStatus = mongoose.models.ModuleStatus || mongoose.model('ModuleStatus', new mongoose.Schema({}, {strict:false}));
  const Lead = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}, {strict:false}));

  const companyId = new mongoose.Types.ObjectId("60d5ecb54ab7358111623456");

  const slaStatuses = await ModuleStatus.find({
    companyId,
    slaHours: { $gt: 0 }
  });

  for (const status of slaStatuses) {
    if (!status.autoNotifyBeforeHours) continue;

    const breachThresholdHours = status.slaHours;
    const notifyThresholdHours = status.slaHours - status.autoNotifyBeforeHours;
    
    const notifyDate = new Date();
    notifyDate.setHours(notifyDate.getHours() - notifyThresholdHours);

    const breachDate = new Date();
    breachDate.setHours(breachDate.getHours() - breachThresholdHours);

    console.log("Status:", status.name);
    console.log("notifyDate (22h ago):", notifyDate);
    console.log("breachDate (24h ago):", breachDate);

    const atRiskLeads = await Lead.find({
      companyId,
      status: status.name,
      updatedAt: { $lt: notifyDate, $gte: breachDate } 
    });

    console.log("At Risk Leads Found:", atRiskLeads.length);
    if(atRiskLeads.length > 0) {
        console.log("Lead updated At:", atRiskLeads[0].updatedAt);
    }
  }

  process.exit(0);
});
