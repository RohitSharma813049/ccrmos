import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Team from '@/modules/companies/schemas/Team';
import { getSession } from '@/lib/auth-utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId;
    if (body.permissions !== undefined) updateData.permissions = body.permissions;
    if (body.members !== undefined) updateData.members = body.members;

    const team = await Team.findOneAndUpdate(
      { _id: id, companyId: companyId },
      { $set: updateData },
      { new: true }
    );

    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ team }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId || user.impersonatedCompanyId;
    if (!companyId) return NextResponse.json({ error: "No company associated" }, { status: 400 });

    const { id } = await params;
    
    const team = await Team.findOneAndDelete({ _id: id, companyId: companyId });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
