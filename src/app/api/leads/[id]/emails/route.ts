import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from '@/lib/access-control';
import { getGoogleClientForUser } from '@/lib/googleClient';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Leads', 'view');
    const { id } = await params;

    const lead = await Lead.findOne({ _id: id, ...buildTenantQuery(user) });
    if (!lead || !lead.email) {
      return NextResponse.json({ error: 'Lead not found or has no email address' }, { status: 404 });
    }

    const companyIdStr = user.companyId ? user.companyId.toString() : (user.impersonatedFounderId ? user.impersonatedFounderId.toString() : '');
    
    let auth;
    try {
      auth = await getGoogleClientForUser(user._id.toString(), companyIdStr);
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Google Workspace not connected' }, { status: 400 });
    }

    const gmail = google.gmail({ version: 'v1', auth });

    // Search for emails to or from the lead
    const query = `to:${lead.email} OR from:${lead.email}`;
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 15,
    });

    const messages = res.data.messages || [];
    
    // Fetch full details for each message
    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date', 'To'],
        });
        
        const headers = msgRes.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find((h) => h.name === 'Date')?.value || '';
        const to = headers.find((h) => h.name === 'To')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msgRes.data.snippet,
          subject,
          from,
          to,
          date,
        };
      })
    );

    // Sort by date descending
    emailDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ emails: emailDetails });
  } catch (error: any) {
    console.error('Failed to fetch Gmails:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
