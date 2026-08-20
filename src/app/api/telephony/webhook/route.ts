import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CallLog from '@/modules/core/schemas/CallLog';
import Lead from '@/modules/leads/schemas/Lead';

// This endpoint receives incoming webhooks from Twilio (StatusCallback)
export async function POST(req: Request) {
  try {
    // Twilio sends application/x-www-form-urlencoded data
    const textBody = await req.text();
    const params = new URLSearchParams(textBody);
    
    const callSid = params.get('CallSid');
    const callStatus = params.get('CallStatus');
    const duration = params.get('CallDuration');
    const recordingUrl = params.get('RecordingUrl');
    
    if (!callSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    await dbConnect();

    // Map Twilio status to our internal status
    let mappedStatus = "in-progress";
    if (callStatus === "completed") mappedStatus = "completed";
    else if (callStatus === "no-answer" || callStatus === "canceled") mappedStatus = "missed";
    else if (callStatus === "failed" || callStatus === "busy") mappedStatus = "failed";

    // Find the existing call log
    const callLog = await CallLog.findOne({ twilioCallSid: callSid });
    
    if (callLog) {
      // Update existing log
      callLog.status = mappedStatus as any;
      if (duration) callLog.durationSeconds = parseInt(duration);
      if (recordingUrl) callLog.recordingUrl = recordingUrl;
      await callLog.save();

      // Automatically add this to the Lead's timeline if a lead is attached
      if (callLog.leadId && callStatus === "completed") {
         await Lead.findByIdAndUpdate(callLog.leadId, {
           $push: {
             activities: {
               type: 'Call',
               description: `Outbound call completed. Duration: ${duration}s.`,
               attachmentUrl: recordingUrl,
               timestamp: new Date()
             }
           }
         });
      }
    } else {
      // If the log doesn't exist yet, we could theoretically create it here
      // But usually the backend creates it when the call is initiated, and Twilio updates it.
      console.log(`[Webhook] Received update for unknown CallSid: ${callSid}`);
    }

    // Twilio expects a 200 OK or TwiML response
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
