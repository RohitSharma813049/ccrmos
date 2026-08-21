import { NextRequest, NextResponse } from 'next/server';
import { processIncomingWhatsAppMessage, getWhatsAppConfig } from '@/lib/whatsappClient';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

// The global verify token for the platform, or it could be tenant-specific
// If tenant-specific, Meta's webhook needs to have the companyId in the query string or path
// We'll assume the webhook URL looks like: /api/whatsapp/webhook?companyId=123

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return new NextResponse('Missing companyId in webhook URL', { status: 400 });
  }

  try {
    const config = await getWhatsAppConfig(companyId);
    if (!config || !config.webhookVerifyToken) {
      return new NextResponse('Webhook verify token not configured', { status: 403 });
    }

    if (mode === 'subscribe' && token === config.webhookVerifyToken) {
      console.log('WEBHOOK VERIFIED FOR COMPANY:', companyId);
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Verification failed', { status: 403 });
    }
  } catch (error) {
    console.error('Webhook verification error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return new NextResponse('Missing companyId in webhook URL', { status: 400 });
    }

    const body = await req.json();

    // Check the incoming webhook payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Check if there are messages
            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const contact = value.contacts?.[0];
              
              if (message.type === 'text') {
                const fromNumber = message.from;
                const messageBody = message.text.body;
                const pushname = contact?.profile?.name || '';
                
                await processIncomingWhatsAppMessage(companyId, fromNumber, messageBody, pushname);
              }
            }
          }
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not a WhatsApp event', { status: 404 });
    }
  } catch (error) {
    console.error('Webhook POST Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
