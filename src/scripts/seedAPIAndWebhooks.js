const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

const ApiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  founderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const WebhookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  endpointUrl: { type: String, required: true },
  secret: { type: String, required: true },
  events: { type: [String], default: ["*"] },
  isActive: { type: Boolean, default: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
  founderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({ email: String, companyId: mongoose.Schema.Types.ObjectId }, { strict: false });

const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema);
const Webhook = mongoose.models.Webhook || mongoose.model("Webhook", WebhookSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const owner = await User.findOne({ email: "owner@crmos.com" });
    if (!owner) {
      console.log("Owner not found, cannot seed.");
      return;
    }

    // Check if API Key already exists
    let apiKey = await ApiKey.findOne({ founderId: owner._id });
    if (!apiKey) {
      apiKey = await ApiKey.create({
        name: "Zapier Integration Key",
        key: "crmos_" + crypto.randomBytes(24).toString('hex'),
        founderId: owner._id,
        companyId: owner.companyId,
        isActive: true
      });
      console.log("Created demo API Key.");
    } else {
      console.log("API Key already exists.");
    }

    // Check if Webhook already exists
    let webhook = await Webhook.findOne({ founderId: owner._id });
    if (!webhook) {
      webhook = await Webhook.create({
        name: "Slack Notifications",
        endpointUrl: "https://example.com/webhook/slack/dummy",
        secret: "wh_sec_" + crypto.randomBytes(16).toString('hex'),
        events: ["lead.created", "invoice.paid"],
        founderId: owner._id,
        companyId: owner.companyId,
        isActive: true
      });
      console.log("Created demo Webhook.");
    } else {
      console.log("Webhook already exists.");
    }

    console.log("Successfully seeded Security & API data!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

seed();
