const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

// Minimal schemas required for seeding
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminEmail: { type: String, required: true },
  plan: { type: String, default: "Basic" },
  usersQuota: { type: Number, default: 5 },
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry' },
  status: { type: String, default: "Active" }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  hierarchyLevel: { type: Number, default: 4 },
  role: { type: String, default: "Admin" }
}, { timestamps: true });

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const industrySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const SystemSetting = mongoose.models.SystemSetting || mongoose.model("SystemSetting", systemSettingSchema);
const Industry = mongoose.models.Industry || mongoose.model("Industry", industrySchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // 1. Industry Type
    let healthcareIndustry = await Industry.findOne({ name: "Healthcare" });
    if (!healthcareIndustry) {
      healthcareIndustry = await Industry.create({ name: "Healthcare" });
      console.log("Created Healthcare industry.");
    }

    // 2. Register Tenant & apply Industry Type
    let cityHospital = await Company.findOne({ adminEmail: "admin@cityhospital.com" });
    if (!cityHospital) {
      cityHospital = await Company.create({
        name: "City Hospital",
        adminEmail: "admin@cityhospital.com",
        plan: "Enterprise",
        usersQuota: 50,
        industryId: healthcareIndustry._id,
        status: "Active"
      });
      console.log("Registered City Hospital tenant.");
      
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Dr. Admin",
        email: "admin@cityhospital.com",
        password: hashedPassword,
        companyId: cityHospital._id,
        hierarchyLevel: 2,
        role: "Tenant Admin"
      });
      console.log("Created admin user for City Hospital.");
    }

    // 3. Custom Domain Setup
    const domainSetting = await SystemSetting.findOne({ key: "whitelabel", companyId: cityHospital._id });
    if (!domainSetting) {
      await SystemSetting.create({
        key: "whitelabel",
        companyId: cityHospital._id,
        value: {
          platformName: "City Hospital Portal",
          primaryColor: "#059669",
          domains: [
            { name: "crm.cityhospital.com", status: "Active" }
          ]
        }
      });
      console.log("Configured Custom Domain 'crm.cityhospital.com' for City Hospital.");
    } else {
      console.log("Custom domain already configured.");
    }

    console.log("Successfully seeded example data!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

seed();
