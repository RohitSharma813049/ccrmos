import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStage from '@/modules/leads/schemas/LeadStage';
import LeadStatus from '@/modules/leads/schemas/LeadStatus';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Settings', 'manage');
    await dbConnect();

    // Default Stages from user's screenshot
    const defaultStages = [
      { name: "Fresh Lead", color: "#eab308", order: 1 },
      { name: "Attempted to Contact", color: "#f97316", order: 2 },
      { name: "Contact in Future", color: "#3b82f6", order: 3 },
      { name: "Contacted", color: "#0ea5e9", order: 4 },
      { name: "Junk Lead", color: "#ef4444", order: 5 },
      { name: "Lost Lead", color: "#a855f7", order: 6 },
      { name: "Not Qualified", color: "#64748b", order: 7 },
      { name: "Pre-Qualified", color: "#14b8a6", order: 8 }
    ];

    const stagesMap = new Map();

    for (const stage of defaultStages) {
      let existing = await LeadStage.findOne({ name: stage.name, companyId: user.companyId });
      if (!existing) {
        existing = await LeadStage.create({
          ...stage,
          companyId: user.companyId
        });
      }
      stagesMap.set(stage.name, existing._id);
    }

    // Default Statuses (examples)
    const freshStageId = stagesMap.get("Fresh Lead");
    if (freshStageId) {
      const defaultStatuses = ["New", "Unassigned"];
      for (const st of defaultStatuses) {
        await LeadStatus.findOneAndUpdate(
          { name: st, companyId: user.companyId },
          { name: st, stageId: freshStageId, active: true, companyId: user.companyId, createdBy: user.id },
          { upsert: true, new: true }
        );
      }
    }

    // Migrate existing leads that have no stageId
    const leadsToMigrate = await Lead.find({ companyId: user.companyId, stageId: { $exists: false } });
    for (const lead of leadsToMigrate) {
      lead.stageId = freshStageId;
      await lead.save();
    }

    return NextResponse.json({ message: "Initialized default stages successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
