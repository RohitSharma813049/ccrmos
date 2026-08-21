import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ConversionRule from '@/modules/settings/schemas/ConversionRule';
import mongoose from 'mongoose';

// Map module names to Mongoose Model names
const moduleModelMap: Record<string, string> = {
  'Leads': 'Lead',
  'Projects': 'Project',
  'Bookings': 'Booking',
  'Tasks': 'Task',
  'Invoices': 'Invoice',
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
    if (!userCompanyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const { ruleId, sourceRecordId } = await req.json();

    await dbConnect();

    const rule = await ConversionRule.findOne({ _id: ruleId, companyId: userCompanyId });
    if (!rule) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });

    const sourceModelName = moduleModelMap[rule.sourceModule] || 'CustomRecord';
    const targetModelName = moduleModelMap[rule.targetModule] || 'CustomRecord';

    const SourceModel = mongoose.models[sourceModelName];
    const TargetModel = mongoose.models[targetModelName];

    if (!SourceModel || !TargetModel) {
      return NextResponse.json({ error: 'Source or Target model not found' }, { status: 400 });
    }

    // Fetch the source record
    const sourceRecord = await SourceModel.findOne({ _id: sourceRecordId, companyId: userCompanyId });
    if (!sourceRecord) return NextResponse.json({ error: 'Source record not found' }, { status: 404 });

    // Map fields
    const targetData: any = {
      companyId: userCompanyId,
    };

    if (targetModelName === 'CustomRecord') {
      targetData.module = rule.targetModule;
      targetData.data = {};
    }

    rule.fieldMappings.forEach((mapping: any) => {
      // Get value from source
      let value = sourceRecord[mapping.sourceField];
      
      // Check if it's in customData for dynamic standard modules
      if (value === undefined && sourceRecord.customData) {
        value = sourceRecord.customData[mapping.sourceField];
      }
      
      // Check if it's in CustomRecord 'data'
      if (value === undefined && sourceRecord.data) {
        value = sourceRecord.data[mapping.sourceField];
      }

      // Set value to target
      if (targetModelName === 'CustomRecord') {
        targetData.data[mapping.targetField] = value;
      } else {
        // Standard model. It might be a top-level field or a customData field
        // Since we don't know the exact schema of the target, we'll try to put it at top-level.
        // If it's a dynamic field for a standard module, it ideally should go in customData, but we'll put it at top-level. 
        // Mongoose strict mode might drop it if it's not in schema, so we should also push to customData just in case.
        targetData[mapping.targetField] = value;
        if (!targetData.customData) targetData.customData = {};
        targetData.customData[mapping.targetField] = value;
      }
    });

    const newTargetRecord = new TargetModel(targetData);
    await newTargetRecord.save();

    // Optionally mark source as converted (if it's a lead)
    if (sourceModelName === 'Lead') {
      sourceRecord.status = 'Converted';
      await sourceRecord.save();
    }

    return NextResponse.json({ success: true, targetId: newTargetRecord._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
