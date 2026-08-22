import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import Company from "../src/modules/companies/schemas/Company";
import User from "../src/modules/users/schemas/User";
import Lead from "../src/modules/leads/schemas/Lead";
import Customer from "../src/modules/customers/schemas/Customer";
import Invoice from "../src/modules/invoices/schemas/Invoice";
import Task from "../src/modules/tasks/schemas/Task";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

const names = ["Acme Corp", "Stark Industries", "Wayne Enterprises", "Oscorp", "Cyberdyne", "Initech", "Umbrella Corp", "Globex", "Soylent", "Massive Dynamic"];
const contacts = ["Tony Stark", "Bruce Wayne", "Norman Osborn", "Miles Dyson", "Bill Lumbergh", "Albert Wesker", "Hank Scorpio", "Charlton Heston", "Walter Bishop", "John Doe"];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const userEmail = "rohitsharma813049@gmail.com";
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`No User found for email: ${userEmail}`);
      process.exit(1);
    }
    
    const company = await Company.findById(user.companyId);
    if (!company) {
      console.log("No Company found for the user.");
      process.exit(1);
    }

    const companyId = company._id;
    const userId = user._id;

    console.log(`Seeding data for Company: ${company.name} | User: ${user.email}`);
    
    // 1. Create Customers
    console.log("Creating Customers...");
    const createdCustomers = [];
    for (let i = 0; i < 5; i++) {
      const idx = getRandomInt(0, names.length - 1);
      const cust = await Customer.create({
        companyId,
        displayId: `CRT-${getRandomInt(10000, 99999)}-${Date.now()}`,
        companyName: names[idx],
        contactName: contacts[idx],
        email: `contact${i}_${Date.now()}@${names[idx].toLowerCase().replace(/\s/g, "")}.com`,
        phone: `+1-555-01${getRandomInt(10, 99)}`,
        status: "active",
        createdBy: userId,
      });
      createdCustomers.push(cust);
    }

    // 2. Create Leads
    console.log("Creating Leads...");
    const statuses = ["New", "Contacted", "Proposal Sent", "Negotiation", "Converted", "Lost"];
    for (let i = 0; i < 20; i++) {
      const idx = getRandomInt(0, names.length - 1);
      await Lead.create({
        companyId,
        displayId: `LD-${getRandomInt(10000, 99999)}-${Date.now()}-${i}`,
        firstName: contacts[idx].split(' ')[0],
        lastName: contacts[idx].split(' ')[1] || '',
        company: names[idx],
        email: `lead${i}_${Date.now()}@${names[idx].toLowerCase().replace(/\s/g, "")}.com`,
        phone: `+1-555-02${getRandomInt(10, 99)}`,
        status: statuses[getRandomInt(0, statuses.length - 1)],
        source: ["Website", "Referral", "LinkedIn", "Cold Call"][getRandomInt(0, 3)],
        assignedTo: userId,
        createdBy: userId,
      });
    }

    // 3. Create Invoices
    console.log("Creating Invoices...");
    const invStatuses = ["Draft", "Sent", "Paid", "Overdue"];
    for (let i = 0; i < 15; i++) {
      const cust = createdCustomers[getRandomInt(0, createdCustomers.length - 1)];
      const invDate = getRandomDate(new Date(2025, 0, 1), new Date());
      const isPaid = Math.random() > 0.5;
      await Invoice.create({
        companyId,
        customerId: cust._id,
        invoiceNumber: `INV-${getRandomInt(10000, 99999)}-${Date.now()}-${i}`,
        date: invDate,
        dueDate: new Date(invDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: isPaid ? "Paid" : invStatuses[getRandomInt(0, invStatuses.length - 1)],
        items: [
          { description: "Software License", quantity: 1, unitPrice: getRandomInt(100, 1000), amount: getRandomInt(100, 1000) }
        ],
        subtotal: 500,
        tax: 50,
        total_amount: getRandomInt(500, 5000),
        createdBy: userId,
        createdAt: invDate // Set created at to scatter data across months for charts
      });
    }

    // 4. Create Tasks/Meetings
    console.log("Creating Tasks and Meetings...");
    for (let i = 0; i < 15; i++) {
      const date = getRandomDate(new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
      await Task.create({
        companyId,
        displayId: `TSK-${getRandomInt(10000, 99999)}-${Date.now()}-${i}`,
        title: `Follow up with ${contacts[getRandomInt(0, contacts.length - 1)]}`,
        description: "Discuss the new proposal.",
        type: Math.random() > 0.5 ? "Meeting" : "Task",
        status: "Pending",
        priority: "High",
        dueDate: date,
        assignedTo: userId,
        createdBy: userId,
      });
    }

    console.log("✅ Database successfully seeded with dummy CRM data!");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
