import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { getRecordScopeFilter } from "@/lib/permissions";

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'view');
    await dbConnect();

    const queryScope = await getRecordScopeFilter(user, "Leads");
    const queryObj = { ...queryScope, status: { $ne: 'Archived' } };

    const pipelineMetrics = await Lead.aggregate([
      { $match: queryObj },
      {
        $group: {
          _id: "$stageId",
          count: { $sum: 1 },
          totalDealValue: { $sum: { $ifNull: ["$dealValue", 0] } }
        }
      },
      {
        $lookup: {
          from: "leadstages", 
          localField: "_id",
          foreignField: "_id",
          as: "stage"
        }
      },
      {
        $unwind: {
          path: "$stage",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          stageId: "$_id",
          stageName: { $ifNull: ["$stage.name", "Unassigned"] },
          count: 1,
          totalDealValue: 1,
          _id: 0
        }
      },
      { $sort: { stageName: 1 } }
    ]);

    const totalPipelineValue = pipelineMetrics.reduce((sum, stage) => sum + stage.totalDealValue, 0);

    return NextResponse.json({ 
      pipelineMetrics,
      totalPipelineValue
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
