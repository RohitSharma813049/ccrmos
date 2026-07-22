// @ts-nocheck
import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../modules/settings/schemas/Coupon";

dotenv.config({ path: ".env.local" });

async function seedCoupons() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  try {
    const coupons = [
      {
        code: "WELCOME50",
        discountType: "percentage",
        discountValue: 50,
        maxUses: 100,
        currentUses: 0,
        isActive: true,
      },
      {
        code: "EARLYBIRD",
        discountType: "fixed",
        discountValue: 20,
        maxUses: null, // Unlimited
        currentUses: 0,
        isActive: true,
      },
      {
        code: "VIP2026",
        discountType: "percentage",
        discountValue: 25,
        maxUses: 50,
        currentUses: 10,
        isActive: true,
        validUntil: new Date("2026-12-31T23:59:59Z")
      }
    ];

    for (const coupon of coupons) {
      // Upsert to avoid duplicate key errors if run multiple times
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        { $set: coupon },
        { upsert: true, new: true }
      );
      console.log(`Created/Updated Coupon: ${coupon.code}`);
    }

    console.log("Seed complete.");
  } catch (error) {
    console.error("Error seeding coupons:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCoupons();
