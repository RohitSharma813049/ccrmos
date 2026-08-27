import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProcessStage from "@/modules/companies/schemas/ProcessStage";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const stages = await ProcessStage.find({ processId: id }).sort({ sequenceOrder: 1 });
    return NextResponse.json({ stages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const body = await req.json();
    
    // Determine the next sequence order
    const lastStage = await ProcessStage.findOne({ processId: id }).sort({ sequenceOrder: -1 });
    const sequenceOrder = lastStage ? lastStage.sequenceOrder + 1 : 1;
    
    const newStage = await ProcessStage.create({
      processId: id,
      sequenceOrder,
      name: body.name,
      assignedToRole: body.assignedToRole,
      slaHours: body.slaHours || 24,
      autoNotifyBeforeHours: body.autoNotifyBeforeHours || 2,
      autoNotifyAfterHours: body.autoNotifyAfterHours || 2
    });
    
    return NextResponse.json({ stage: newStage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
