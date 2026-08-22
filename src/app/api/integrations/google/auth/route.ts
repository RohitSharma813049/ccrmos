import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    
    if (!companyId) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`;

    if (!clientId) {
      return NextResponse.json({ error: "Google Client ID not configured by platform owner" }, { status: 500 });
    }

    // Google OAuth URL construction
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
    const state = encodeURIComponent(companyId.toString());
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Failed to initiate Google OAuth" }, { status: 500 });
  }
}
