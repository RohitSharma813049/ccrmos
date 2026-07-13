import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Coupon from "@/modules/settings/schemas/Coupon";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { code, discountType, discountValue, maxUses, validUntil } = await req.json();
    
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Code, discount type, and value are required." }, { status: 400 });
    }
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 400 });
    }
    
    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      maxUses: maxUses ? Number(maxUses) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: true
    });
    
    return NextResponse.json({ message: "Coupon created.", coupon: newCoupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
