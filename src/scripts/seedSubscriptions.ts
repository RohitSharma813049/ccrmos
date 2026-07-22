// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import SubscriptionPlan from "../modules/settings/schemas/SubscriptionPlan";

dotenv.config({ path: ".env.local" });

async function seedSubscriptions() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const plans = [
      {
        name: "Basic",
        price: 29,
        billing: "Monthly",
        users: "5 Users",
        features: ["Core CRM", "Basic Reporting", "Email Support"],
        maxCustomForms: 2,
        isActive: true,
      },
      {
        name: "Pro",
        price: 79,
        billing: "Monthly",
        users: "15 Users",
        features: ["Everything in Basic", "Advanced Workflows", "API Access", "Priority Support"],
        maxCustomForms: 10,
        isActive: true,
      },
      {
        name: "Enterprise",
        price: 199,
        billing: "Monthly",
        users: "Unlimited",
        features: ["Everything in Pro", "Custom Integrations", "Dedicated Account Manager", "White-Labeling"],
        maxCustomForms: 100,
        isActive: true,
      }
    ];

    for (const plan of plans) {
      await SubscriptionPlan.create(plan);
      console.log(`Created Subscription Plan: ${plan.name}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding subscriptions:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSubscriptions();
