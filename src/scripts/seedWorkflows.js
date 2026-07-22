const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

const workflowSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  active: { type: Boolean, default: true },
  trigger: { type: String, required: true },
  conditions: Array,
  actions: Array,
}, { timestamps: true });

const Workflow = mongoose.models.Workflow || mongoose.model("Workflow", workflowSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const workflows = [
      {
        title: "Nightly Database Sync",
        description: "Syncs core models to the analytical warehouse",
        active: true,
        trigger: "CRON",
        conditions: [],
        actions: [{ type: "Execute Script", payload: { scriptName: "sync_warehouse" } }]
      },
      {
        title: "New Lead Routing",
        description: "Automatically assigns new leads to sales reps based on industry",
        active: false,
        trigger: "EVENT",
        conditions: [{ field: "type", operator: "equals", value: "lead_created" }],
        actions: [{ type: "Assign User", payload: { algorithm: "round_robin" } }]
      },
      {
        title: "Subscription Expiration Alert",
        description: "Notifies the Platform Owner when a tenant's subscription is 3 days from expiring",
        active: true,
        trigger: "CRON",
        conditions: [],
        actions: [{ type: "Send Email", payload: { template: "tenant_expiring_soon" } }]
      }
    ];

    await Workflow.insertMany(workflows);
    console.log("Successfully seeded workflows!");
  } catch (error) {
    console.error("Error seeding workflows:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
