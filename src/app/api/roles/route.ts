import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { RoleService } from "@/modules/roles/services/role.service";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const hLevel = user.hierarchyLevel || 6;
  const companyId = user.companyId;

  let query: any = {};
  if (hLevel > 1) {
    query.companyId = companyId; // Non-platform owners only see their company's roles
  } else if (user.impersonatedFounderId) {
    // Platform owner is impersonating a tenant, they should see the tenant's roles
    // Wait, roles are linked to companyId. If impersonating, we need the tenant's companyId.
    // If the session has impersonatedCompanyId, use it. Otherwise, we might have to look it up.
    // Let's assume the session has it or we just use user.companyId if not?
    // User session contains companyId of the impersonated user if it was updated during impersonation.
    query.companyId = companyId; 
  } else {
    // Platform owner managing their own internal roles
    query.companyId = companyId;
  }

  let roles = await RoleService.getRoles(query.companyId);

  // Filter out roles that are above the current user's hierarchy
  // Basic hierarchy names mapped to levels:
  const hierarchyMap: Record<string, number> = {
    owner: 1,
    founder: 2,
    director: 3,
    manager: 4,
    team_leader: 5,
    employee: 6
  };

  // Always hide top-level owner/founder roles from the company roles management UI
  roles = roles.filter(r => {
    const name = r.name.toLowerCase();
    if (name === 'owner' || name === 'founder' || name === 'platform owner') {
      return false;
    }
    return true;
  });

  if (hLevel > 1) {
    roles = roles.filter(r => {
      const roleLevel = hierarchyMap[r.name.toLowerCase()] || 6;
      return roleLevel >= hLevel; 
    });
  }

  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  await dbConnect();
  const data = await req.json();

  const user = session.user as any;
  if (user.hierarchyLevel > 1) {
    data.companyId = user.companyId; // Force company ID to current user's company
  }

  try {
    const role = await RoleService.createRole(data);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const data = await req.json();
  const { id, ...updateData } = data;

  if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

  const user = session.user as any;
  const hLevel = user.hierarchyLevel || 6;
  
  try {
    const existingRole = await mongoose.models.Role.findById(id);
    if (!existingRole) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const hierarchyMap: Record<string, number> = {
      owner: 1, founder: 2, director: 3, manager: 4, team_leader: 5, employee: 6
    };
    const roleLevel = hierarchyMap[existingRole.name.toLowerCase()] || 6;

    if (hLevel > 1 && roleLevel < hLevel) {
      return NextResponse.json({ message: "Forbidden: Cannot edit roles above your hierarchy level." }, { status: 403 });
    }

    const role = await RoleService.updateRole(id, updateData);
    return NextResponse.json({ role }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

  await dbConnect();
  
  const user = session.user as any;
  const hLevel = user.hierarchyLevel || 6;

  try {
    const existingRole = await mongoose.models.Role.findById(id);
    if (!existingRole) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const hierarchyMap: Record<string, number> = {
      owner: 1, founder: 2, director: 3, manager: 4, team_leader: 5, employee: 6
    };
    const roleLevel = hierarchyMap[existingRole.name.toLowerCase()] || 6;

    if (hLevel > 1 && roleLevel <= hLevel) { // Founders can't delete Founders or Owners
      return NextResponse.json({ message: "Forbidden: Cannot delete roles at or above your hierarchy level." }, { status: 403 });
    }

    await RoleService.deleteRole(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
