import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DocumentModel from '@/modules/core/schemas/Document';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    // Parse query params to filter by related entity
    const { searchParams } = new URL(req.url);
    const relatedToModel = searchParams.get('relatedToModel');
    const relatedToId = searchParams.get('relatedToId');

    const query: any = { companyId: user.companyId };
    
    if (relatedToModel && relatedToId) {
      query.relatedToModel = relatedToModel;
      query.relatedToId = relatedToId;
    }

    const documents = await DocumentModel.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { name, url, documentType, relatedToModel, relatedToId, signatureStatus } = await req.json();

    const document = await DocumentModel.create({
      companyId: user.companyId,
      name,
      url,
      documentType,
      relatedToModel,
      relatedToId,
      signatureStatus: signatureStatus || "Not Required",
      uploadedBy: user.id
    });

    return NextResponse.json({ document });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
