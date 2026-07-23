import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import crypto from 'crypto';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    
    // Check permission to share/update invoices
    await requirePermission('Invoices', 'update');

    const { id: invoiceId } = await params;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Ensure it belongs to their tenant
    const isOwner = user.hierarchyLevel === 2 
      ? String(invoice.companyId) === String(user.companyId)
      : String(invoice.founderId) === String(user.founderId);

    if (!isOwner && user.hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Generate token if not exists
    if (!invoice.shareToken) {
      invoice.shareToken = crypto.randomBytes(32).toString('hex');
      await invoice.save();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/invoice/${invoice.shareToken}`;

    return NextResponse.json({ shareUrl, token: invoice.shareToken }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
