import { NextResponse } from 'next/server';
import twilio from 'twilio';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const to = formData.get('To') as string;
    
    // In Twilio Voice SDK (browser), any custom params passed into device.connect() 
    // are forwarded as POST form data to this webhook!
    const companyId = formData.get('companyId') as string;
    
    await dbConnect();
    const settingQuery = companyId ? { key: 'twilio_config', companyId } : { key: 'twilio_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    if (!setting || !setting.value || !setting.value.fromNumber) {
      response.say("Twilio is not configured properly in the CRM.");
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const { fromNumber } = setting.value;

    if (to) {
      // Dial the outbound number
      const dial = response.dial({ callerId: fromNumber });
      
      // Wrap the number to ensure it dials as a standard PSTN number
      dial.number(to);
    } else {
      response.say("No phone number to dial provided.");
    }

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('Failed to generate TwiML:', error);
    const response = new twilio.twiml.VoiceResponse();
    response.say("An application error occurred.");
    return new NextResponse(response.toString(), {
      status: 500,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
