import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

// PUT /api/subscriptions/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const { 
      name, price, billing, users, features, isActive,
      maxUsers, maxRoles, maxTeams, maxCampaigns, 
      aiFeatures, apiIntegration, allowWhiteLabeling, planType, allowedModules, industryId
    } = await req.json();
    
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { 
        name, 
        price: price !== undefined ? Number(price) : undefined, 
        billing, 
        users, 
        features,
        maxUsers,
        maxRoles,
        maxTeams,
        maxCampaigns,
        aiFeatures,
        apiIntegration,
        allowWhiteLabeling,
        planType,
        allowedModules,
        industryId: industryId || null,
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Plan updated successfully.", plan: updatedPlan }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/subscriptions/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    
    // Soft deletion: we don't want to break tenants currently on this plan
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Subscription tier deactivated successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
