import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

async function refreshAccessToken(companyId: string, refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (response.ok) {
    const setting = await SystemSetting.findOne({ key: 'google_calendar_config', companyId });
    if (setting) {
      setting.value.access_token = data.access_token;
      setting.value.expiry_date = Date.now() + (data.expires_in * 1000);
      setting.markModified('value');
      await setting.save();
    }
    return data.access_token;
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const setting = await SystemSetting.findOne({ key: 'google_calendar_config', companyId });
    if (!setting || !setting.value || !setting.value.access_token) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
    }

    let accessToken = setting.value.access_token;
    
    // Check if token expired
    if (setting.value.expiry_date && Date.now() > setting.value.expiry_date) {
      accessToken = await refreshAccessToken(companyId.toString(), setting.value.refresh_token);
      if (!accessToken) {
        return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 });
      }
    }

    // Fetch next 10 upcoming events from primary calendar
    const timeMin = new Date().toISOString();
    const gcalResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&orderBy=startTime&singleEvents=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const gcalData = await gcalResponse.json();

    if (!gcalResponse.ok) {
      return NextResponse.json({ error: gcalData.error?.message || "Failed to fetch from Google Calendar" }, { status: gcalResponse.status });
    }

    // Map Google events to CRM format (Mocked mapping for demonstration)
    const events = gcalData.items.map((item: any) => ({
      id: item.id,
      title: item.summary || "No Title",
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
      description: item.description,
      source: "google"
    }));

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error("Calendar Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
