import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await dbConnect();
    const invoice = await Invoice.findOne({ shareToken: token }).lean();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found or invalid token" }, { status: 404 });
    }

    // Omit sensitive data like creator info, just return invoice details
    const publicData = {
      displayId: invoice.displayId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      customData: invoice.customData
    };

    return NextResponse.json({ invoice: publicData }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
