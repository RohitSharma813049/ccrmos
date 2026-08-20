import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Commission from '@/modules/core/schemas/Commission';
import Property from '@/modules/properties/schemas/Property';
import User from '@/modules/users/schemas/User';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Commissions', 'edit'); 

    await dbConnect();
    
    const { propertyId, leadId, agentId, grossCommissionAmount } = await req.json();

    if (!propertyId || !leadId || !agentId || !grossCommissionAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [property, agent] = await Promise.all([
      Property.findById(propertyId),
      User.findById(agentId)
    ]);

    if (!property || !agent) {
      return NextResponse.json({ error: "Property or Agent not found" }, { status: 404 });
    }

    // Default to 50% split if not set
    const agentSplitPercentage = agent.defaultCommissionSplit || 50;
    
    // Calculate Agent Take Home
    const agentTakeHomeAmount = (grossCommissionAmount * agentSplitPercentage) / 100;

    const commission = await Commission.create({
      companyId: user.companyId,
      propertyId,
      leadId,
      agentId,
      dealValue: property.price,
      grossCommissionAmount,
      agentSplitPercentage,
      agentTakeHomeAmount,
      currency: (property as any).currency || "USD",
      status: "Pending"
    });

    return NextResponse.json({ commission }, { status: 201 });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    // Agents can view their own, Managers can view all
    const isManager = user.hierarchyLevel && user.hierarchyLevel <= 4;
    
    if (!isManager) {
      await requirePermission('Commissions', 'view');
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    const query: any = { companyId: user.companyId };
    
    // If regular agent, lock to their own ID. If manager and requested specific agent, use that.
    if (!isManager) {
      query.agentId = user.id;
    } else if (agentId) {
      query.agentId = agentId;
    }

    const commissions = await Commission.find(query)
      .populate('agentId', 'name email avatarUrl')
      .populate('propertyId', 'title location')
      .populate('leadId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ commissions });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
