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
    if (pipelines.length === 0) {
      let defaultStages: any[] = [];
      if (module === "lead") {
        defaultStages = [
          { name: "New", order: 0 },
          { name: "Contacted", order: 1 },
          { name: "Qualified", order: 2 },
          { name: "Converted", order: 3 },
        ];
      } else if (module === "customer") {
        defaultStages = [
          { name: "Onboarding", order: 0 },
          { name: "Active", order: 1 },
          { name: "At Risk", order: 2 },
          { name: "Churned", order: 3 },
        ];
      } else if (module === "project") {
        defaultStages = [
          { name: "Planning", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Review", order: 2 },
          { name: "Completed", order: 3 },
        ];
      } else if (module === "invoice") {
        defaultStages = [
          { name: "Draft", order: 0 },
          { name: "Sent", order: 1 },
          { name: "Overdue", order: 2 },
          { name: "Paid", order: 3 },
        ];
      }

      if (defaultStages.length > 0) {
        return NextResponse.json({
          pipeline: {
            module,
            stages: defaultStages
          }
        });
      }
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
