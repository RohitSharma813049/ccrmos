import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Doc from '@/modules/documents/schemas/Document';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const { id } = await params;

    // TODO: Ideally we should recursively delete child documents if it's a folder
    const document = await Doc.findOneAndDelete({ _id: id, companyId });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
