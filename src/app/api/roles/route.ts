import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import { RoleService } from "@/modules/roles/services/role.service";

export async function GET() {
  await dbConnect();
  // We can fetch by companyId from session later, for now return all
  const roles = await RoleService.getRoles();
  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  await dbConnect();
  const data = await req.json();

  try {
    const role = await RoleService.createRole(data);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  const data = await req.json();
  const { id, ...updateData } = data;

  if (!id) {
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  }

  try {
    const role = await RoleService.updateRole(id, updateData);
    return NextResponse.json({ role }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  }

  await dbConnect();
  try {
    await RoleService.deleteRole(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
