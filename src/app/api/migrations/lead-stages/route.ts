import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LeadStage from '@/modules/leads/schemas/LeadStage';
import LeadStatus from '@/modules/leads/schemas/LeadStatus';
import Lead from '@/modules/leads/schemas/Lead';

export async function GET() {
  await dbConnect();
  try {
    // Check if stages already exist to avoid duplicate migrations
    const existingStages = await LeadStage.countDocuments();
    if (existingStages > 0) {
      return NextResponse.json({ message: "Stages already migrated" });
    }

    // Get all statuses to find their companies
    const allStatuses = await LeadStatus.find({});
    
    // Get unique companyIds
    const companyIds = [...new Set(allStatuses.map(s => s.companyId?.toString()).filter(Boolean))];

    for (const companyId of companyIds) {
      // 1. Create Default Stages for this company
      const freshStage = await LeadStage.create({ name: 'Fresh', color: '#3B82F6', order: 1, companyId });
      const contactedStage = await LeadStage.create({ name: 'Contacted', color: '#8B5CF6', order: 2, companyId });
      const interestedStage = await LeadStage.create({ name: 'Interested', color: '#EC4899', order: 3, companyId });
      
      // 2. Map existing statuses to stages based on previous 'category' or name
      const companyStatuses = await LeadStatus.find({ companyId });
      for (const status of companyStatuses) {
        // Fallback mapping
        let assignedStageId = freshStage._id;
        
        // This relies on whatever data is currently in DB, using fallback 'Fresh'
        if (status.name.toLowerCase().includes('contact') || (status as any).category === 'Neutral') {
            assignedStageId = contactedStage._id;
        } else if (status.name.toLowerCase().includes('interest') || (status as any).category === 'Interested') {
            assignedStageId = interestedStage._id;
        }
        
        status.stageId = assignedStageId;
        await status.save();
      }

      // 3. Update Leads that have a status, to also have the correct stageId
      const leads = await Lead.find({ companyId });
      for (const lead of leads) {
         if (lead.status) {
            const lStatus = companyStatuses.find(s => s.name === lead.status);
            if (lStatus) {
               lead.stageId = lStatus.stageId;
               await lead.save();
            }
         }
      }
    }

    return NextResponse.json({ success: true, message: "Migration completed successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
