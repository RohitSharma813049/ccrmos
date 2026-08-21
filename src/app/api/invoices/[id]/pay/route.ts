import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { Types } from 'mongoose';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    const queryObj = { _id: (await params).id, ...buildTenantQuery(user) };

    const invoice = await Invoice.findOne(queryObj);
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    if (invoice.status === 'Paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    // Fetch stripe config
    const setting = await SystemSetting.findOne({ key: 'stripe_config', companyId });

    if (!setting || !setting.value || !setting.value.secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured for this workspace' }, { status: 400 });
    }

    const { secretKey } = setting.value;
    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' as any });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get('origin') || 'http://localhost:3000');

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: (invoice.currency || 'USD').toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.displayId || invoice.invoiceNumber}`,
              description: 'Payment for CRM Invoice'
            },
            unit_amount: Math.round(invoice.amount * 100), // Stripe expects cents
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard/invoices?paid=true&invoice_id=${invoice._id}`,
      cancel_url: `${baseUrl}/dashboard/invoices?canceled=true`,
      client_reference_id: invoice._id.toString(),
      metadata: {
        invoiceId: invoice._id.toString(),
        companyId: companyId.toString()
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
