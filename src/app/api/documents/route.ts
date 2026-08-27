import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Doc from '@/modules/documents/schemas/Document';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId') || null;

    const query: any = { companyId };
    if (parentId && parentId !== 'null') {
      query.parentId = parentId;
    } else {
      query.parentId = null; // Root level
    }

    const documents = await Doc.find(query).sort({ type: -1, name: 1 });

    return NextResponse.json({ success: true, documents });
  } catch (error: any) {
    console.error("Fetch Documents Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const body = await req.json();

    const newDoc = await Doc.create({
      companyId,
      name: body.name,
      type: body.type, // 'file' or 'folder'
      size: body.size,
      mimeType: body.mimeType,
      fileUrl: body.fileUrl, // Simulated URL for MVP
      parentId: body.parentId || null,
      createdBy: user.id, // Fixed: use user.id from session
    });

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (error: any) {
    console.error("Create Document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
