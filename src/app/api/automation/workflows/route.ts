import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Workflow from '@/modules/automation/schemas/Workflow';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch workflows for the current company (or global if we allow global workflows)
    // The existing Workflow schema has companyId as required.
    const companyId = user.companyId;

    const workflows = await Workflow.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json({ workflows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const companyId = user.companyId;

    const newWorkflow = await Workflow.create({
      ...body,
      companyId,
      conditions: body.conditions || [],
      actions: body.actions || []
    });

    return NextResponse.json({ workflow: newWorkflow }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
