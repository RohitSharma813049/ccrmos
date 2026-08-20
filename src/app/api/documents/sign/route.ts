import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentModel from '@/modules/core/schemas/Document';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { documentId, signatureStatus, signedBy } = await req.json();

    const document = await DocumentModel.findOne({ _id: documentId, companyId: user.companyId });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    document.signatureStatus = signatureStatus || "Signed";
    
    if (document.signatureStatus === "Signed") {
      document.signedAt = new Date();
      document.signedBy = signedBy || user.email || user.id;
    }

    await document.save();

    return NextResponse.json({ document });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
