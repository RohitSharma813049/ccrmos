import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomModule from '@/modules/settings/schemas/CustomModule';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;
    
    // For now, Platform Owner gets their global modules. Tenants get theirs + global ones.
    const query = companyId ? { $or: [{ companyId }, { companyId: null }] } : { companyId: null };
    
    const modules = await CustomModule.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ modules });
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

    const body = await req.json();
    const companyId = user.hierarchyLevel === 1 ? null : user.companyId;

    const newModule = await CustomModule.create({
      ...body,
      companyId
    });

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
