import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Workflow from '@/modules/automation/schemas/Workflow';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const fetchGlobal = url.searchParams.get("global") === "true";

    // If global flag is passed and user is a Platform Owner, fetch global workflows
    const companyId = (fetchGlobal && user.hierarchyLevel === 1) ? null : (user.companyId || null);

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
    
    // Determine companyId: if user is Platform Owner creating a global workflow, it stays null (if they have no companyId)
    // Or if the request explicitly asks for global creation and they are platform owner
    const isGlobal = body.isGlobal && user.hierarchyLevel === 1;
    const companyId = isGlobal ? null : (user.companyId || null);

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
