import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSession } from "@/lib/auth-utils";
import Workflow from "@/modules/automation/schemas/Workflow";

// GET /api/workflows
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "No company context" }, { status: 400 });
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const workflows = await Workflow.find({ companyId }).sort({ createdAt: -1 });
    
    return NextResponse.json({ workflows }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/workflows
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check - only admins/founders should create workflows typically
    // For MVP, if they have a companyId, we proceed. In production, check PERMISSIONS.MANAGE_AUTOMATIONS.
    
    const companyId = (session.user as any).companyId;
    if (!companyId) {
      return NextResponse.json({ error: "No company context" }, { status: 400 });
    }

    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { title, description, trigger, conditions, actions, active } = await req.json();

    if (!title || !trigger || !conditions || !actions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newWorkflow = await Workflow.create({
      companyId,
      title,
      description,
      trigger,
      conditions,
      actions,
      active: active !== undefined ? active : true
    });

    return NextResponse.json({ message: "Workflow created", workflow: newWorkflow }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
