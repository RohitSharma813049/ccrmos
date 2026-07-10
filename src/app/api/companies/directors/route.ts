import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch Level 3 users (Directors) for the company
    const directors = await User.find({ 
      companyId: user.companyId,
      hierarchyLevel: 3 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ directors });
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

    const newDirector = await User.create({
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      role: body.department, // For mock purposes
      hierarchyLevel: 3,
      companyId: user.companyId,
      isActive: true
    });

    return NextResponse.json({ director: newDirector }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
