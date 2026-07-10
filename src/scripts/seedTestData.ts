import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Import Models
import Company from "../modules/companies/schemas/Company";
import User from "../modules/users/schemas/User";
import Lead from "../modules/leads/schemas/Lead";
import Customer from "../modules/customers/schemas/Customer";
import Project from "../modules/projects/schemas/Project";
import Invoice from "../modules/invoices/schemas/Invoice";

async function seedTestData() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB for test data seeding!");

  try {
    // 1. Create a Test Company
    let company = await Company.findOne({ name: "Acme Corp" });
    if (!company) {
      company = await Company.create({
        name: "Acme Corp",
        status: "Active",
        adminEmail: "founder@acme.com",
      });
      console.log("Created Company: Acme Corp");
    }

    // 2. Ensure Founder role exists
    const { default: Role } = await import("../modules/roles/schemas/Role");
    let founderRole = await Role.findOne({ name: "founder", companyId: company._id });
    if (!founderRole) {
      founderRole = await Role.create({
        name: "founder",
        companyId: company._id,
        permissions: {} as any,
      });
    }

    // 3. Create a Founder / Director for the company
    let founder = await User.findOne({ email: "founder@acme.com" });
    if (!founder) {
      founder = await User.create({
        email: "founder@acme.com",
        companyId: company._id,
        hierarchyLevel: 2, // Founder Level
        role: founderRole._id,
      });
      console.log("Created Founder: founder@acme.com");
    }

    // 3. Clear existing test data for this company to avoid massive duplicates if run multiple times
    await Lead.deleteMany({ companyId: company._id });
    await Customer.deleteMany({ companyId: company._id });
    await Project.deleteMany({ companyId: company._id });
    await Invoice.deleteMany({ companyId: company._id });

    // 4. Create Leads
    const leadStatuses = ["New", "Contacted", "Qualified", "Lost"];
    for (let i = 1; i <= 8; i++) {
      await Lead.create({
        companyId: company._id,
        firstName: `Lead`,
        lastName: `Person ${i}`,
        email: `lead${i}@example.com`,
        status: leadStatuses[i % leadStatuses.length],
        createdBy: founder._id,
      });
    }
    console.log("Created 8 Leads");

    // 5. Create Customers
    const customerStatuses = ["Active", "Inactive"];
    for (let i = 1; i <= 5; i++) {
      await Customer.create({
        companyId: company._id,
        companyName: `Test Client Co ${i}`,
        contactName: `Client Contact ${i}`,
        email: `customer${i}@example.com`,
        status: customerStatuses[i % customerStatuses.length],
        createdBy: founder._id,
      });
    }
    console.log("Created 5 Customers");

    // 6. Create Projects
    const projectStatuses = ["Not Started", "In Progress", "Completed", "On Hold"];
    for (let i = 1; i <= 4; i++) {
      await Project.create({
        companyId: company._id,
        name: `Website Redesign Phase ${i}`,
        description: `Project description for Phase ${i}`,
        status: projectStatuses[i % projectStatuses.length],
        startDate: new Date(),
        createdBy: founder._id,
      });
    }
    console.log("Created 4 Projects");

    // 7. Create Invoices
    const invoiceStatuses = ["Draft", "Sent", "Paid", "Overdue"];
    for (let i = 1; i <= 6; i++) {
      await Invoice.create({
        companyId: company._id,
        invoiceNumber: `INV-100${i}`,
        amount: Math.floor(Math.random() * 5000) + 100,
        status: invoiceStatuses[i % invoiceStatuses.length],
        issueDate: new Date(),
        dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        createdBy: founder._id,
      });
    }
    console.log("Created 6 Invoices");

    console.log("✅ Test Data Seeding Complete!");
  } catch (error) {
    console.error("Error seeding test data:", error);
  } finally {
    process.exit(0);
  }
}

seedTestData();
