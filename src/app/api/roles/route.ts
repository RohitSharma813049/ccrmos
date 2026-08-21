import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Role from '@/modules/users/schemas/Role';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    // Usually only Founders/Admins can manage roles
    await requirePermission('RoleManagement', 'view'); 
    
    await dbConnect();

    const roles = await Role.find({ companyId: user.companyId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ roles });
  } catch (error: any) {
    // If they lack permission, they get a 403 or 500 depending on how requirePermission throws.
    // auth-utils throws an Error, so it comes here as 500, but we can check message.
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('RoleManagement', 'edit');
    await dbConnect();
    
    const { name, description, permissions } = await req.json();

    // permissions should be an object like { Leads: { view: true, edit: true } }
    const role = await Role.create({
      companyId: user.companyId,
      name,
      description,
      permissions
    });

    return NextResponse.json({ role });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    // Handle duplicate key error
    if (error.code === 11000) {
       return NextResponse.json({ error: "A role with this name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('RoleManagement', 'edit');
    await dbConnect();
    
    const { id, name, description, permissions } = await req.json();

    if (!id) return NextResponse.json({ error: "Role ID is required" }, { status: 400 });

    const role = await Role.findOneAndUpdate(
      { _id: id, companyId: user.companyId },
      { name, description, permissions },
      { new: true }
    );

    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    return NextResponse.json({ role });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    if (error.code === 11000) {
       return NextResponse.json({ error: "A role with this name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('RoleManagement', 'delete');
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Role ID is required" }, { status: 400 });

    // Ensure we don't delete roles that are in use
    const User = require('@/modules/users/schemas/User').default;
    const usersWithRole = await User.countDocuments({ companyId: user.companyId, role: id, roleModel: "Role" });
    if (usersWithRole > 0) {
      return NextResponse.json({ error: `Cannot delete role because it is assigned to ${usersWithRole} user(s).` }, { status: 400 });
    }

    const role = await Role.findOneAndDelete({ _id: id, companyId: user.companyId });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
