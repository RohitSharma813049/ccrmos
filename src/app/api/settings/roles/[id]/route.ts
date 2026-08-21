import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import Role from '@/modules/settings/schemas/Role';
import User from '@/modules/users/schemas/User';
import { PERMISSIONS } from '@/config/permissions';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
       await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);
    }
    await dbConnect();
    
    const { id } = await params;
    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    const body = await req.json();
    
    // Check if renaming to an existing name
    if (body.name) {
      const existing = await Role.findOne({ companyId, name: body.name, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 });
      }
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, companyId },
      { $set: body },
      { new: true }
    );

    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    return NextResponse.json({ role });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    if (user.hierarchyLevel !== 1) {
       await requirePermission(PERMISSIONS.CONFIGURE_COMPANY_AUTOMATIONS);
    }
    await dbConnect();
    
    const { id } = await params;
    const companyId = user.companyId || user.impersonatedFounderId;
    if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ companyId, role: id, roleModel: "Role" });
    if (usersWithRole > 0) {
      return NextResponse.json({ error: `Cannot delete role because it is assigned to ${usersWithRole} user(s).` }, { status: 400 });
    }

    const role = await Role.findOneAndDelete({ _id: id, companyId });
    if (!role) return NextResponse.json({ error: 'Role not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
