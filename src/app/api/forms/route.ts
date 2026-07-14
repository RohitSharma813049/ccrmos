import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/modules/forms/schemas/Form';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const companyId = user.companyId;

    const forms = await Form.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json({ forms });
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
    const companyId = user.companyId;

    const newForm = await Form.create({
      ...body,
      companyId,
      founderId: user.hierarchyLevel === 2 ? user.id : user.founderId,
      fields: body.fields || []
    });

    return NextResponse.json({ form: newForm }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
