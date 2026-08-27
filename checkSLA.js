const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const ModuleStatus = mongoose.models.ModuleStatus || mongoose.model('ModuleStatus', new mongoose.Schema({}, {strict:false}));
  const Lead = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}, {strict:false}));
  const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({}, {strict:false}));

  const slaStatuses = await ModuleStatus.find({slaHours: {$gt: 0}});
  console.log('SLA Statuses:', slaStatuses.length);

  const leads = await Lead.find({});
  console.log('Total Leads:', leads.length);
  
  const atRiskCount = await Lead.find({
    status: { $in: slaStatuses.map(s => s.name) }
  });
  console.log('Leads in SLA Statuses:', atRiskCount.length);

  const notifs = await Notification.find({title: /SLA/});
  console.log('SLA Notifications Sent:', notifs.length);

  process.exit(0);
});
