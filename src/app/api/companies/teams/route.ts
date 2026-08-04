import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/modules/companies/schemas/Team';
import Department from '@/modules/companies/schemas/Department';
import { getSession } from '@/lib/auth-utils';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ teams: [] });

    const teams = await Team.find({ companyId })
      .populate("departmentId", "name departmentCode")
      .populate("members", "name email");

    return NextResponse.json({ teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ error: "No company associated with this user." }, { status: 400 });

    const body = await req.json();

    const newTeam = await Team.create({
      name: body.name || "Unnamed Team",
      departmentId: body.departmentId,
      companyId: companyId,
      permissions: body.permissions || [],
      members: body.members || [],
    });

    return NextResponse.json({ team: newTeam }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
