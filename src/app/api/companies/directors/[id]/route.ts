import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/modules/users/schemas/User';
import { getSession } from "@/lib/auth-utils";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const session = await getSession();
    const user = session?.user as any;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const directorId = params.id;

    // Verify it's a director in the current company
    const director = await User.findOne({ _id: directorId, companyId: user.companyId, hierarchyLevel: 3 });
    
    if (!director) {
      return NextResponse.json({ error: "Director not found" }, { status: 404 });
    }

    if (body.isActive !== undefined) {
      director.isActive = body.isActive;
    }

    await director.save();

    return NextResponse.json({ director });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
