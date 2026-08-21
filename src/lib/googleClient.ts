import { google } from 'googleapis';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import User from '@/modules/users/schemas/User';
import dbConnect from '@/lib/db';

/**
 * Get an authenticated Google OAuth2 Client for a specific user
 */
export async function getGoogleClientForUser(userId: string, companyId: string) {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user || !user.googleRefreshToken) {
    throw new Error('User has not connected their Google account.');
  }

  const settingQuery = companyId ? { key: 'google_config', companyId } : { key: 'google_config' };
  const setting = await SystemSetting.findOne(settingQuery);

  if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret) {
    throw new Error('Google Workspace integration is not configured for this CRM instance.');
  }

  const { clientId, clientSecret } = setting.value;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: user.googleRefreshToken,
  });

  return oauth2Client;
}

/**
 * Send an email via the user's connected Gmail account
 */
export async function sendGmail(userId: string, companyId: string, to: string, subject: string, text: string) {
  const auth = await getGoogleClientForUser(userId, companyId);
  const gmail = google.gmail({ version: 'v1', auth });

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    text, // For a real implementation, you might want to convert text to HTML
  ];
  const message = messageParts.join('\n');

  // The body needs to be base64url encoded.
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
}

/**
 * Create a Google Calendar Event
 */
export async function createGoogleCalendarEvent(userId: string, companyId: string, eventDetails: any) {
  const auth = await getGoogleClientForUser(userId, companyId);
  const calendar = google.calendar({ version: 'v3', auth });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startTime,
      },
      end: {
        dateTime: eventDetails.endTime,
      },
    },
  });

  return res.data;
}
