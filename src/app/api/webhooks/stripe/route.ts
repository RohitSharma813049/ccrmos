import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    // Since webhooks hit a global endpoint, we need to extract companyId from query or metadata
    // Usually Stripe webhooks are configured per account. 
    // In a multi-tenant setup, the webhook might contain the companyId in metadata.
    const url = new URL(req.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      // In a real multi-tenant app with Stripe Connect, this would be different.
      // For single tenant fallback:
      console.warn("Stripe Webhook missing companyId query param, proceeding with caution.");
    }

    await dbConnect();

    // Fetch stripe config for this company (or a global one)
    const settingQuery = companyId ? { key: 'stripe_config', companyId } : { key: 'stripe_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
    }

    const { secretKey, webhookSecret } = setting.value;
    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' as any });

    let event: Stripe.Event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Fallback if no webhook secret is set (not recommended for production)
      event = JSON.parse(body);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract invoice ID from client_reference_id or metadata
      const invoiceId = session.client_reference_id || session.metadata?.invoiceId;

      if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice) {
          invoice.status = 'Paid';
          if (!invoice.customData) invoice.customData = {};
          invoice.customData.stripeSessionId = session.id;
          invoice.customData.stripePaymentIntent = session.payment_intent;
          await invoice.save();
          console.log(`[Stripe] Invoice ${invoiceId} marked as Paid`);

          // Sync to QuickBooks
          try {
            if (companyId) {
              const { syncInvoiceToQuickbooks } = await import('@/lib/quickbooksClient');
              const qboId = await syncInvoiceToQuickbooks(invoiceId, companyId);
              console.log(`[QuickBooks] Synced invoice to QBO: ${qboId}`);
            }
          } catch (err: any) {
            console.warn(`[QuickBooks Sync Error]: ${err.message}`);
          }
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const invoiceId = paymentIntent.metadata?.invoiceId;
      if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice) {
          invoice.status = 'Paid';
          if (!invoice.customData) invoice.customData = {};
          invoice.customData.stripePaymentIntent = paymentIntent.id;
          await invoice.save();
          console.log(`[Stripe] Invoice ${invoiceId} marked as Paid via payment_intent.succeeded`);

          // Sync to QuickBooks
          try {
            if (companyId) {
              const { syncInvoiceToQuickbooks } = await import('@/lib/quickbooksClient');
              const qboId = await syncInvoiceToQuickbooks(invoiceId, companyId);
              console.log(`[QuickBooks] Synced invoice to QBO: ${qboId}`);
            }
          } catch (err: any) {
            console.warn(`[QuickBooks Sync Error]: ${err.message}`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
