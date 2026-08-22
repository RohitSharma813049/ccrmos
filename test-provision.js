const mongoose = require('mongoose');
const { CompanyService } = require('./src/modules/companies/services/company.service.ts');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crmos');
  
  // Register a fake tenant
  const payload = {
    name: "Auto Provision Test Co",
    adminEmail: "autotest@example.com",
    usersQuota: 10
  };
  
  try {
    const newCompany = await CompanyService.registerTenant(payload);
    console.log("Tenant Registered:", newCompany._id);
    
    // Check Roles
    const roles = await mongoose.connection.db.collection('roles').find({ companyId: newCompany._id }).toArray();
    console.log("Roles Provisioned:", roles.map(r => r.name));
    
    // Check Modules
    const modules = await mongoose.connection.db.collection('companymodules').find({ company_id: newCompany._id }).toArray();
    console.log("Modules Provisioned:", modules.map(m => m.display_name));
    
  } catch(e) {
    console.error(e);
  }
  
  process.exit(0);
}

run();
