import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import Role from '@/modules/settings/schemas/Role';
import { PERMISSIONS } from '@/config/permissions';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    // Only founders / users with explicit access can manage roles
    if (user.hierarchyLevel !== 1) {
       await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS); // Using an existing config permission or we could define a new one, but this works for now to restrict to admins
    }
    await dbConnect();
    
    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const roles = await Role.find({ companyId }).sort({ name: 1 });
    return NextResponse.json({ roles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
       await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);
    }
    await dbConnect();

    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const body = await req.json();
    
    // Check if role name already exists for this company
    const existing = await Role.findOne({ companyId, name: body.name });
    if (existing) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 });
    }

    const role = new Role({
      ...body,
      companyId,
    });

    await role.save();
    return NextResponse.json({ role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
