import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import Property from '@/modules/properties/schemas/Property';
import User from '@/modules/users/schemas/User';
import AuditLog from '@/modules/core/schemas/AuditLog';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

function flattenObject(ob: any): any {
  const toReturn: any = {};
  for (const i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) === 'object' && ob[i] !== null && !(ob[i] instanceof Date) && !Array.isArray(ob[i])) {
      const flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    // Strict RBAC: Only managers/founders can export data
    await requirePermission('Exports', 'view'); 

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module')?.toLowerCase() || 'leads';
    
    let data: any[] = [];
    let targetModelForAudit: any = "Lead";

    if (moduleName === 'leads') {
      data = await Lead.find({ companyId: user.companyId }).lean();
      targetModelForAudit = "Lead";
    } else if (moduleName === 'properties') {
      data = await Property.find({ companyId: user.companyId }).lean();
      targetModelForAudit = "Property";
    } else if (moduleName === 'users') {
      data = await User.find({ companyId: user.companyId }).lean();
      targetModelForAudit = "User";
    } else {
      return NextResponse.json({ error: "Invalid module parameter" }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found to export" }, { status: 404 });
    }

    // Security Audit Log - Record the mass export!
    await AuditLog.create({
      companyId: user.companyId,
      actorId: user.id,
      action: "EXPORT",
      targetModel: targetModelForAudit,
      changes: {
        newValues: { exportCount: data.length, module: moduleName }
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown',
      userAgent: req.headers.get('user-agent') || 'Unknown'
    });

    // Convert JSON to CSV
    const flattenedData = data.map(doc => flattenObject(doc));
    
    // Get all unique keys for headers
    const headers = Array.from(
      new Set(flattenedData.flatMap(obj => Object.keys(obj)))
    );

    const csvRows = [];
    // Add header row
    csvRows.push(headers.map(h => `"${h}"`).join(','));

    // Add data rows
    for (const row of flattenedData) {
      const values = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString();
        if (Array.isArray(val)) val = val.join('; ');
        
        // Escape quotes
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${moduleName}_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
