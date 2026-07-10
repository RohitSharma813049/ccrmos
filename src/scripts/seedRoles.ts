import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import Company from "../modules/companies/schemas/Company";
import Role from "../modules/roles/schemas/Role";
import User from "../modules/users/schemas/User";

async function seedRolesAndUsers() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for Role Seeding!");

  try {
    const company = await Company.findOne({ name: "Acme Corp" });
    if (!company) {
      console.log("Acme Corp not found. Please run seedTestData.ts first.");
      process.exit(1);
    }

    // Define the roles
    const standardRoles = [
      { name: "director", permissions: ["all"], level: 3 },
      { name: "manager", permissions: ["leads:read", "leads:write", "customers:read", "customers:write", "projects:read", "projects:write"], level: 4 },
      { name: "team_leader", permissions: ["leads:read", "leads:write", "customers:read"], level: 5 },
      { name: "employee", permissions: ["leads:read"], level: 6 }
    ];

    for (const r of standardRoles) {
      // 1. Create or find the Role
      let roleDoc = await Role.findOne({ name: r.name, companyId: company._id });
      if (!roleDoc) {
        roleDoc = await Role.create({
          name: r.name,
          companyId: company._id,
          permissions: r.permissions,
        });
        console.log(`Created Role: ${r.name}`);
      }

      // 2. Create a test user for this role
      const testEmail = `${r.name}@acme.com`;
      let userDoc = await User.findOne({ email: testEmail });
      if (!userDoc) {
        userDoc = await User.create({
          email: testEmail,
          companyId: company._id,
          hierarchyLevel: r.level,
          role: roleDoc._id,
          status: "active"
        });
        console.log(`Created Test User: ${testEmail}`);
      }
    }

    console.log("✅ Roles & Test Users Seeding Complete!");
  } catch (error) {
    console.error("Error seeding roles:", error);
  } finally {
    process.exit(0);
  }
}

seedRolesAndUsers();
