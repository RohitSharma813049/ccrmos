import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/modules/projects/schemas/Project';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const projects = await Project.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 });
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newProject = await Project.create(body);
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });

    const project = await Project.findById(_id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && project.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "project" });
      
      let stages = pipeline?.stages || [
        { name: "Planning", order: 0 },
        { name: "In Progress", order: 1 },
        { name: "Review", order: 2 },
        { name: "Completed", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === project.status);
      const newStage = stages.find(s => s.name === status);

      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      project.status = status;
    }

    Object.assign(project, updateData);
    await project.save();

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
