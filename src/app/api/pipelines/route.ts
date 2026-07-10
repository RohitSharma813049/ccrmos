import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;
    
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module");

    const query: any = { companyId: user.companyId };
    if (module) query.module = module;

    const pipelines = await Pipeline.find(query);
    
    // If no pipeline exists, we can return a default structure for the frontend to use
    if (pipelines.length === 0 && module === "lead") {
      return NextResponse.json({
        pipeline: {
          module: "lead",
          stages: [
            { name: "New", order: 0 },
            { name: "Contacted", order: 1 },
            { name: "Qualified", order: 2 },
            { name: "Converted", order: 3 },
          ]
        }
      });
    }

    return NextResponse.json({ pipeline: pipelines[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as any;

    const body = await req.json();
    const { module, stages } = body;

    let pipeline = await Pipeline.findOne({ companyId: user.companyId, module });
    
    if (pipeline) {
      pipeline.stages = stages;
      await pipeline.save();
    } else {
      pipeline = await Pipeline.create({
        companyId: user.companyId,
        module,
        stages
      });
    }

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
