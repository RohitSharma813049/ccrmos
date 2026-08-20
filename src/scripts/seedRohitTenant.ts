import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import Company from "../modules/companies/schemas/Company";
import User from "../modules/users/schemas/User";
import Role from "../modules/roles/schemas/Role";
import Form from "../modules/forms/schemas/Form";
import FormSubmission from "../modules/forms/schemas/FormSubmission";
import Lead from "../modules/leads/schemas/Lead";
import Customer from "../modules/customers/schemas/Customer";
import Project from "../modules/projects/schemas/Project";
import Task from "../modules/tasks/schemas/Task";
import Invoice from "../modules/invoices/schemas/Invoice";
import Order from "../modules/orders/schemas/Order";
import LeadStage from "../modules/leads/schemas/LeadStage";
import LeadStatus from "../modules/leads/schemas/LeadStatus";
import Voice from "../modules/ai/schemas/Voice";
import Agent from "../modules/ai/schemas/Agent";
import CampaignSetting from "../modules/marketing/schemas/CampaignSetting";
import CustomModule from "../modules/settings/schemas/CustomModule";
import DynamicRecord from "../modules/dynamic/schemas/DynamicRecord";

async function seedRohitTenant() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/crmos";
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for Rohit Tenant Seeding!");

  const targetEmail = "rohitsharma813049@gmail.com";

  try {
    // 1. Company Setup
    let company = await Company.findOne({ adminEmail: targetEmail });
    if (!company) {
      company = await Company.findOne({ name: "Rohit Enterprises" });
    }
    if (!company) {
      company = await Company.create({
        name: "Rohit Enterprises",
        adminEmail: targetEmail,
        plan: "Enterprise",
        usersQuota: 50,
        country: "US",
        currency: "USD",
        status: "Active",
        subscriptionStatus: "active"
      });
      console.log(`✅ Created Company: ${company.name}`);
    } else {
      console.log(`ℹ️ Found existing Company: ${company.name} (${company._id})`);
    }

    const companyId = company._id;

    // 2. Roles Setup
    const defaultPermissions = {
      leads: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      customers: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      projects: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      tasks: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      invoices: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      orders: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} },
      forms: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true, approve: true, recordScope: "Company", fieldPermissions: { hiddenFields: [], readOnlyFields: [] }, actionPermissions: {} }
    };

    const rolesList = [
      { name: "founder", description: "Company Founder & Owner", isSystem: true },
      { name: "director", description: "Director / Executive Level", isSystem: false },
      { name: "manager", description: "Department Manager", isSystem: false },
      { name: "team_leader", description: "Team Leader / Supervisor", isSystem: false },
      { name: "employee", description: "Sales / Operations Representative", isSystem: false }
    ];

    const roleDocs: Record<string, any> = {};
    for (const r of rolesList) {
      let roleDoc = await Role.findOne({ name: r.name, companyId });
      if (!roleDoc) {
        roleDoc = await Role.create({
          name: r.name,
          companyId,
          description: r.description,
          permissions: defaultPermissions as any,
          isSystem: r.isSystem
        });
        console.log(`✅ Created Role: ${r.name}`);
      }
      roleDocs[r.name] = roleDoc;
    }

    // 3. User Hierarchy Setup for rohitsharma813049@gmail.com
    let founder = await User.findOne({ email: targetEmail });
    if (!founder) {
      founder = await User.create({
        email: targetEmail,
        name: "Rohit Sharma",
        companyId,
        hierarchyLevel: 2, // Founder Level
        role: roleDocs.founder._id,
        isActive: true,
        phone: "+1-555-0199",
        bio: "Founder & CEO of Rohit Enterprises"
      });
      console.log(`✅ Created Founder User: ${targetEmail}`);
    } else {
      founder.companyId = companyId;
      founder.hierarchyLevel = 2;
      founder.role = roleDocs.founder._id;
      founder.name = founder.name || "Rohit Sharma";
      founder.isActive = true;
      await founder.save();
      console.log(`ℹ️ Updated Founder User: ${targetEmail}`);
    }

    const founderId = founder._id;

    // Seed Hierarchical Users under Rohit Sharma
    const subUsers = [
      { email: "director.rohit@example.com", name: "Ananya Sharma", role: roleDocs.director._id, level: 3, phone: "+1-555-0101", directorId: founderId },
      { email: "manager.rohit@example.com", name: "Vikram Malhotra", role: roleDocs.manager._id, level: 4, phone: "+1-555-0102", directorId: founderId },
      { email: "tl.rohit@example.com", name: "Priya Patel", role: roleDocs.team_leader._id, level: 5, phone: "+1-555-0103", directorId: founderId },
      { email: "emp1.rohit@example.com", name: "Rahul Verma", role: roleDocs.employee._id, level: 6, phone: "+1-555-0104", directorId: founderId },
      { email: "emp2.rohit@example.com", name: "Neha Singh", role: roleDocs.employee._id, level: 6, phone: "+1-555-0105", directorId: founderId }
    ];

    const createdUsers: any[] = [founder];
    for (const u of subUsers) {
      let userDoc = await User.findOne({ email: u.email });
      if (!userDoc) {
        userDoc = await User.create({
          email: u.email,
          name: u.name,
          companyId,
          founderId,
          hierarchyLevel: u.level,
          role: u.role,
          directorId: u.directorId,
          isActive: true,
          phone: u.phone
        });
        console.log(`✅ Created User: ${u.email} (${u.name})`);
      }
      createdUsers.push(userDoc);
    }

    // 4. Seed Forms & Form Submissions
    await Form.deleteMany({ companyId: companyId.toString() });
    await FormSubmission.deleteMany({ companyId: companyId.toString() });

    const form1 = await Form.create({
      companyId: companyId.toString(),
      founderId,
      title: "Contact Us & Inquiry Form",
      description: "Primary website contact form for sales and general inquiries.",
      fields: [
        { id: "full_name", type: "text", label: "Full Name", required: true, placeholder: "John Doe" },
        { id: "email_address", type: "email", label: "Email Address", required: true, placeholder: "john@company.com" },
        { id: "phone_number", type: "phone", label: "Phone Number", required: false, placeholder: "+1 (555) 000-0000" },
        { id: "service_interest", type: "select", label: "Interested In", required: true, options: ["Software Solutions", "Consulting", "Cloud Integration", "Enterprise Support"] },
        { id: "message", type: "textarea", label: "Message / Requirements", required: true, placeholder: "Tell us about your project..." }
      ],
      isActive: true,
      notifyOnSubmit: true,
      submitButtonText: "Submit Inquiry",
      successMessage: "Thank you for reaching out! A representative will contact you within 24 hours."
    });

    const form2 = await Form.create({
      companyId: companyId.toString(),
      founderId,
      title: "Product Demo Request",
      description: "Lead generation form for requesting custom enterprise software product demos.",
      fields: [
        { id: "company_name", type: "text", label: "Company Name", required: true, placeholder: "Acme Corp" },
        { id: "contact_name", type: "text", label: "Contact Name", required: true, placeholder: "Alice Smith" },
        { id: "work_email", type: "email", label: "Work Email", required: true, placeholder: "alice@acme.com" },
        { id: "team_size", type: "select", label: "Company Size", required: true, options: ["1-10", "11-50", "51-200", "200+"] },
        { id: "preferred_date", type: "date", label: "Preferred Demo Date", required: false }
      ],
      isActive: true,
      notifyOnSubmit: true,
      submitButtonText: "Request Demo",
      successMessage: "Demo request received! Our sales team will follow up shortly with calendar invites."
    });

    const form3 = await Form.create({
      companyId: companyId.toString(),
      founderId,
      title: "Customer NPS & Feedback Survey",
      description: "Post-onboarding quarterly customer satisfaction survey.",
      fields: [
        { id: "customer_name", type: "text", label: "Your Name", required: true },
        { id: "nps_rating", type: "select", label: "How likely are you to recommend us? (1-10)", required: true, options: ["10 - Extremely Likely", "9", "8", "7", "6 - Neutral", "5 or below"] },
        { id: "feedback_text", type: "textarea", label: "What can we do to improve?", required: false }
      ],
      isActive: true,
      notifyOnSubmit: false,
      submitButtonText: "Submit Feedback",
      successMessage: "Thank you for helping us improve our platform!"
    });

    console.log("✅ Seeded 3 Custom Forms");

    // Form Submissions
    await FormSubmission.insertMany([
      {
        formId: form1._id,
        companyId: companyId.toString(),
        data: {
          full_name: "Michael Scott",
          email_address: "mscott@dundermifflin.com",
          phone_number: "+1-555-0188",
          service_interest: "Software Solutions",
          message: "We need an integrated CRM for our regional paper distribution offices."
        }
      },
      {
        formId: form1._id,
        companyId: companyId.toString(),
        data: {
          full_name: "David Wallace",
          email_address: "dwallace@suckit.com",
          phone_number: "+1-555-0199",
          service_interest: "Enterprise Support",
          message: "Looking for enterprise tier SLA support and dedicated account management."
        }
      },
      {
        formId: form2._id,
        companyId: companyId.toString(),
        data: {
          company_name: "Stark Industries",
          contact_name: "Pepper Potts",
          work_email: "pepper@starkindustries.com",
          team_size: "200+",
          preferred_date: "2026-08-15"
        }
      },
      {
        formId: form2._id,
        companyId: companyId.toString(),
        data: {
          company_name: "Wayne Enterprises",
          contact_name: "Lucius Fox",
          work_email: "lfox@wayneenterprises.com",
          team_size: "51-200",
          preferred_date: "2026-08-18"
        }
      },
      {
        formId: form3._id,
        companyId: companyId.toString(),
        data: {
          customer_name: "Bruce Banner",
          nps_rating: "10 - Extremely Likely",
          feedback_text: "Outstanding customer service and fast onboarding experience!"
        }
      }
    ]);
    console.log("✅ Seeded 5 Form Submissions");

    // 5. Lead Stages & Lead Statuses
    await LeadStage.deleteMany({ companyId });
    const stages = await LeadStage.insertMany([
      { name: "New Lead", color: "#3B82F6", order: 1, active: true, companyId },
      { name: "Contacted", color: "#F59E0B", order: 2, active: true, companyId },
      { name: "Qualified", color: "#8B5CF6", order: 3, active: true, companyId },
      { name: "Proposal Sent", color: "#EC4899", order: 4, active: true, companyId },
      { name: "Won", color: "#10B981", order: 5, active: true, companyId },
      { name: "Lost", color: "#EF4444", order: 6, active: true, companyId }
    ]);
    console.log("✅ Seeded Lead Stages");

    await LeadStatus.deleteMany({ companyId });
    await LeadStatus.insertMany([
      { name: "Hot Prospect", stageId: stages[2]._id, active: true, color: "#EF4444", iconColor: "bg-red-500", category: "Interested", companyId },
      { name: "Warm Opportunity", stageId: stages[1]._id, active: true, color: "#F59E0B", iconColor: "bg-yellow-500", category: "Interested", companyId },
      { name: "Nurturing", stageId: stages[0]._id, active: true, color: "#3B82F6", iconColor: "bg-blue-500", category: "New", companyId },
      { name: "Unresponsive", stageId: stages[5]._id, active: true, color: "#6B7280", iconColor: "bg-gray-500", category: "Not Interested", companyId }
    ]);
    console.log("✅ Seeded Lead Statuses");

    // 6. Seed Leads
    await Lead.deleteMany({ companyId });
    await Lead.insertMany([
      { displayId: "L-2001", firstName: "Robert", lastName: "Baratheon", email: "robert@king.org", phone: "555-100-2001", status: "Hot Prospect", founderId, companyId, assignedUserId: createdUsers[1]._id, createdBy: founderId },
      { displayId: "L-2002", firstName: "Cersei", lastName: "Lannister", email: "cersei@casterly.com", phone: "555-100-2002", status: "Warm Opportunity", founderId, companyId, assignedUserId: createdUsers[2]._id, createdBy: founderId },
      { displayId: "L-2003", firstName: "Jon", lastName: "Snow", email: "jon@watch.org", phone: "555-100-2003", status: "Nurturing", founderId, companyId, assignedUserId: createdUsers[3]._id, createdBy: founderId },
      { displayId: "L-2004", firstName: "Daenerys", lastName: "Targaryen", email: "dany@dragons.io", phone: "555-100-2004", status: "Hot Prospect", founderId, companyId, assignedUserId: createdUsers[4]._id, createdBy: founderId },
      { displayId: "L-2005", firstName: "Arya", lastName: "Stark", email: "arya@braavos.com", phone: "555-100-2005", status: "Qualified", founderId, companyId, assignedUserId: createdUsers[5]._id, createdBy: founderId },
      { displayId: "L-2006", firstName: "Tyrion", lastName: "Lannister", email: "tyrion@hand.org", phone: "555-100-2006", status: "Proposal Sent", founderId, companyId, assignedUserId: founderId, createdBy: founderId },
      { displayId: "L-2007", firstName: "Sansa", lastName: "Stark", email: "sansa@winterfell.gov", phone: "555-100-2007", status: "New", founderId, companyId, assignedUserId: createdUsers[1]._id, createdBy: founderId },
      { displayId: "L-2008", firstName: "Bran", lastName: "Stark", email: "bran@raven.org", phone: "555-100-2008", status: "Won", founderId, companyId, assignedUserId: createdUsers[2]._id, createdBy: founderId }
    ]);
    console.log("✅ Seeded 8 Leads");

    // 7. Seed Customers
    await Customer.deleteMany({ companyId });
    await Customer.insertMany([
      { displayId: "C-2001", contactName: "Eleanor Vance", companyName: "Apex Global Tech", email: "eleanor@apexglobal.com", phone: "555-200-1001", status: "Active", founderId, companyId, assignedUserId: founderId },
      { displayId: "C-2002", contactName: "Marcus Brody", companyName: "Museum of Antiquities", email: "brody@museum.edu", phone: "555-200-1002", status: "Active", founderId, companyId, assignedUserId: createdUsers[1]._id },
      { displayId: "C-2003", contactName: "Marion Ravenwood", companyName: "Ravenwood Trading", email: "marion@ravenwood.com", phone: "555-200-1003", status: "Active", founderId, companyId, assignedUserId: createdUsers[2]._id },
      { displayId: "C-2004", contactName: "Henry Jones", companyName: "Grail Research Corp", email: "henry@grail.org", phone: "555-200-1004", status: "Inactive", founderId, companyId, assignedUserId: createdUsers[3]._id },
      { displayId: "C-2005", contactName: "Willem Dafoe", companyName: "OsCorp Industries", email: "willem@oscorp.com", phone: "555-200-1005", status: "Active", founderId, companyId, assignedUserId: createdUsers[4]._id }
    ]);
    console.log("✅ Seeded 5 Customers");

    // 8. Seed Projects
    await Project.deleteMany({ companyId });
    await Project.insertMany([
      { displayId: "P-2001", name: "Enterprise ERP Integration", status: "In Progress", progress: 65, founderId, companyId, assignedUserId: founderId, startDate: new Date("2026-06-01") },
      { displayId: "P-2002", name: "Mobile App Development v2.0", status: "In Progress", progress: 40, founderId, companyId, assignedUserId: createdUsers[1]._id, startDate: new Date("2026-07-15") },
      { displayId: "P-2003", name: "Cloud Infrastructure Migration", status: "Planning", progress: 10, founderId, companyId, assignedUserId: createdUsers[2]._id, startDate: new Date("2026-08-01") },
      { displayId: "P-2004", name: "AI Voice Bot Deployment", status: "Completed", progress: 100, founderId, companyId, assignedUserId: createdUsers[3]._id, startDate: new Date("2026-05-10") },
      { displayId: "P-2005", name: "Security & Compliance Audit", status: "In Progress", progress: 85, founderId, companyId, assignedUserId: createdUsers[4]._id, startDate: new Date("2026-07-01") }
    ]);
    console.log("✅ Seeded 5 Projects");

    // 9. Seed Tasks
    await Task.deleteMany({ companyId });
    await Task.insertMany([
      { displayId: "T-2001", title: "Finalize architecture design specs", status: "Done", priority: "High", founderId, companyId, assignedUserId: founderId },
      { displayId: "T-2002", title: "Configure Twilio & ElevenLabs API keys", status: "In Progress", priority: "High", founderId, companyId, assignedUserId: createdUsers[1]._id },
      { displayId: "T-2003", title: "Review quarterly sales targets & KPIs", status: "Todo", priority: "Medium", founderId, companyId, assignedUserId: createdUsers[2]._id },
      { displayId: "T-2004", title: "Prepare demo sandbox for Stark Industries", status: "In Progress", priority: "High", founderId, companyId, assignedUserId: createdUsers[3]._id },
      { displayId: "T-2005", title: "Audit user roles & permissions matrix", status: "Todo", priority: "Low", founderId, companyId, assignedUserId: createdUsers[4]._id },
      { displayId: "T-2006", title: "Customer satisfaction review call", status: "Done", priority: "Medium", founderId, companyId, assignedUserId: createdUsers[5]._id }
    ]);
    console.log("✅ Seeded 6 Tasks");

    // 10. Seed Invoices
    await Invoice.deleteMany({ companyId });
    await Invoice.insertMany([
      { displayId: "INV-2001", invoiceNumber: "INV-2026-0801", amount: 4500, status: "Paid", approvalStatus: "Approved", founderId, companyId, createdBy: founderId, issueDate: new Date("2026-08-01"), dueDate: new Date("2026-08-15") },
      { displayId: "INV-2002", invoiceNumber: "INV-2026-0802", amount: 12500, status: "Sent", approvalStatus: "Approved", founderId, companyId, createdBy: founderId, issueDate: new Date("2026-08-05"), dueDate: new Date("2026-08-20") },
      { displayId: "INV-2003", invoiceNumber: "INV-2026-0803", amount: 3200, status: "Draft", approvalStatus: "Pending", founderId, companyId, createdBy: createdUsers[1]._id, issueDate: new Date("2026-08-08"), dueDate: new Date("2026-08-22") },
      { displayId: "INV-2004", invoiceNumber: "INV-2026-0804", amount: 8900, status: "Overdue", approvalStatus: "Approved", founderId, companyId, createdBy: createdUsers[2]._id, issueDate: new Date("2026-07-01"), dueDate: new Date("2026-07-15") }
    ]);
    console.log("✅ Seeded 4 Invoices");

    // 11. Seed Orders
    await Order.deleteMany({ companyId });
    await Order.insertMany([
      { displayId: "ORD-2001", orderNumber: "ORD-2026-901", amount: 1200, status: "Completed", founderId, companyId, createdBy: founderId },
      { displayId: "ORD-2002", orderNumber: "ORD-2026-902", amount: 3400, status: "Processing", founderId, companyId, createdBy: createdUsers[1]._id },
      { displayId: "ORD-2003", orderNumber: "ORD-2026-903", amount: 650, status: "Completed", founderId, companyId, createdBy: createdUsers[2]._id }
    ]);
    console.log("✅ Seeded 3 Orders");

    // 12. Seed Voices & AI Agents
    await Voice.deleteMany({ companyId });
    await Voice.insertMany([
      { name: "Rohit AI Assistant", voiceId: "voice_rohit_01", category: "Custom", description: "Professional executive tone", companyId },
      { name: "Sarah Support", voiceId: "voice_sarah_02", category: "Premade", description: "Warm and reassuring customer service voice", companyId }
    ]);
    console.log("✅ Seeded Voices");

    await Agent.deleteMany({ companyId });
    await Agent.insertMany([
      { name: "Inbound Lead Representative", agentId: "agent_rohit_sales", role: "Sales Rep", category: "Sales", description: "Qualifies inbound web leads and schedules calendar demos", companyId },
      { name: "24/7 Technical Support Bot", agentId: "agent_rohit_support", role: "Support Agent", category: "Support", description: "Answers common technical support questions and logs tickets", companyId }
    ]);
    console.log("✅ Seeded AI Agents");

    // 13. Seed Campaign Settings
    await CampaignSetting.deleteMany({ companyId });
    await CampaignSetting.insertMany([
      { name: "Q3 Enterprise Software Campaign", type: "Buyer", category: "Hot", processed: 45, companyId, assignedTo: founderId },
      { name: "Website Contact Form Inbound", type: "Lead", category: "Warm", processed: 180, companyId, assignedTo: createdUsers[1]._id }
    ]);
    console.log("✅ Seeded Campaign Settings");

    // 14. Seed Custom Modules & Dynamic Records
    await CustomModule.deleteMany({ companyId });
    const customModules = await CustomModule.insertMany([
      {
        name: "Properties & Assets",
        active: true,
        tenantScope: "Tenant",
        companyId,
        fields: [
          { name: "Asset Name", type: "text", required: true },
          { name: "Location / Campus", type: "text", required: false },
          { name: "Valuation (USD)", type: "number", required: true },
          { name: "Status", type: "select", required: true }
        ]
      }
    ]);
    console.log("✅ Seeded Custom Module");

    await DynamicRecord.deleteMany({ companyId });
    await DynamicRecord.insertMany([
      {
        moduleId: customModules[0]._id,
        companyId,
        createdBy: founderId,
        data: { "Asset Name": "Silicon Valley Data Center", "Location / Campus": "San Jose, CA", "Valuation (USD)": 15000000, "Status": "Active" }
      },
      {
        moduleId: customModules[0]._id,
        companyId,
        createdBy: founderId,
        data: { "Asset Name": "East Coast Logistics Hub", "Location / Campus": "Newark, NJ", "Valuation (USD)": 8500000, "Status": "Operational" }
      }
    ]);
    console.log("✅ Seeded Dynamic Records");

    console.log("\n==========================================");
    console.log(`🎉 SUCCESS! Seeded complete tenant data for:`);
    console.log(`Email: ${targetEmail}`);
    console.log(`Company: ${company.name} (${companyId})`);
    console.log(`Founder ID: ${founderId}`);
    console.log("==========================================\n");

  } catch (error) {
    console.error("❌ Error seeding tenant data:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedRohitTenant();
