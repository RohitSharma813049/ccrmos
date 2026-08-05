import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/users/schemas/User";
import Lead from "./src/modules/leads/schemas/Lead";
import Customer from "./src/modules/customers/schemas/Customer";
import Project from "./src/modules/projects/schemas/Project";
import Task from "./src/modules/tasks/schemas/Task";
import Voice from "./src/modules/ai/schemas/Voice";
import Agent from "./src/modules/ai/schemas/Agent";
import CampaignSetting from "./src/modules/marketing/schemas/CampaignSetting";

dotenv.config({ path: ".env.local" });

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crmos";

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const user = await User.findOne({ email: "newuser@gmail.com" });
  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }

  const founderId = user.hierarchyLevel === 2 ? user._id : user.founderId;
  const companyId = user.companyId;

  console.log(`Seeding data for founderId: ${founderId}, companyId: ${companyId}`);

  // Seeding Leads
  await Lead.deleteMany({ founderId });
  await Lead.insertMany([
    { displayId: "L-1001", firstName: "John", lastName: "Doe", email: "john@example.com", phone: "1234567890", status: "New", founderId, companyId, assignedUserId: user._id },
    { displayId: "L-1002", firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "0987654321", status: "Contacted", founderId, companyId, assignedUserId: user._id },
    { displayId: "L-1003", firstName: "Acme", lastName: "Corp", email: "contact@acme.com", phone: "5551234567", status: "Qualified", founderId, companyId, assignedUserId: user._id }
  ]);
  console.log("Seeded Leads");

  // Seeding Customers
  await Customer.deleteMany({ founderId });
  await Customer.insertMany([
    { displayId: "C-1001", contactName: "Alice Johnson", companyName: "Tech Innovations Inc.", email: "alice@example.com", phone: "1112223333", founderId, companyId, assignedUserId: user._id },
    { displayId: "C-1002", contactName: "Bob Williams", companyName: "Global Solutions LLC", email: "bob@example.com", phone: "4445556666", founderId, companyId, assignedUserId: user._id }
  ]);
  console.log("Seeded Customers");

  // Seeding Projects
  await Project.deleteMany({ founderId });
  await Project.insertMany([
    { displayId: "P-1001", name: "Website Redesign", status: "Active", progress: 25, founderId, companyId, assignedUserId: user._id },
    { displayId: "P-1002", name: "Marketing Campaign Q4", status: "Planning", progress: 0, founderId, companyId, assignedUserId: user._id }
  ]);
  console.log("Seeded Projects");

  // Seeding Tasks
  await Task.deleteMany({ founderId });
  await Task.insertMany([
    { displayId: "T-1001", title: "Review mockups", status: "Todo", priority: "High", founderId, companyId, assignedUserId: user._id },
    { displayId: "T-1002", title: "Send email blast", status: "In Progress", priority: "Medium", founderId, companyId, assignedUserId: user._id },
    { displayId: "T-1003", title: "Client check-in", status: "Done", priority: "Low", founderId, companyId, assignedUserId: user._id }
  ]);
  console.log("Seeded Tasks");

  const finalCompanyId = companyId || founderId;

  // Seeding Voices
  await Voice.deleteMany({ companyId: finalCompanyId }); // Voice doesn't use founderId
  await Voice.insertMany([
    { name: "Rachel", voiceId: "voice_123", category: "Premade", description: "Friendly and professional", companyId: finalCompanyId },
    { name: "Drew", voiceId: "voice_456", category: "Custom", description: "Deep and authoritative", companyId: finalCompanyId }
  ]);
  console.log("Seeded Voices");

  // Seeding Agents
  await Agent.deleteMany({ companyId: finalCompanyId }); // Agent doesn't use founderId
  await Agent.insertMany([
    { name: "Sales Assistant", agentId: "agent_123", role: "Sales Rep", category: "Sales", description: "Handles initial sales inquiries", companyId: finalCompanyId },
    { name: "Support Bot", agentId: "agent_456", role: "Support Agent", category: "Support", description: "Answers common support questions", companyId: finalCompanyId }
  ]);
  console.log("Seeded Agents");

  // Seeding Campaign Settings
  await CampaignSetting.deleteMany({ companyId: finalCompanyId });
  await CampaignSetting.insertMany([
    { name: "Holiday Promo (Form ID 1)", type: "Buyer", category: "Hot", processed: 15, companyId: finalCompanyId, assignedTo: user._id },
    { name: "Newsletter Signup (Form ID 2)", type: "Lead", category: "Warm", processed: 120, companyId: finalCompanyId, assignedTo: user._id }
  ]);
  console.log("Seeded Campaign Settings");

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
