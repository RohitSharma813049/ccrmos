import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    // Only Directors/Founders can install company-wide apps
    if (user.role?.name !== 'Founder' && user.role?.name !== 'Director') {
      return NextResponse.json({ error: "Unauthorized. Only Admins can install marketplace apps." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const appName = searchParams.get('app');

    if (!appName) {
      return NextResponse.json({ error: "App name is required" }, { status: 400 });
    }

    // Determine the OAuth URL based on the requested app
    let redirectUrl = "";
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUri = encodeURIComponent(`${baseUrl}/api/marketplace/callback`);
    
    // We pass the companyId in the state parameter to recover it in the callback
    const state = encodeURIComponent(JSON.stringify({ 
      companyId: user.companyId.toString(), 
      userId: user._id.toString(),
      appName 
    }));

    switch (appName.toUpperCase()) {
      case "SLACK":
        const slackClientId = process.env.SLACK_CLIENT_ID || "mock_client_id";
        const slackScopes = "channels:read,chat:write,incoming-webhook";
        redirectUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=${slackScopes}&redirect_uri=${callbackUri}&state=${state}`;
        break;
      
      case "DOCUSIGN":
        const docusignClientId = process.env.DOCUSIGN_CLIENT_ID || "mock_client_id";
        redirectUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${docusignClientId}&redirect_uri=${callbackUri}&state=${state}`;
        break;

      default:
        return NextResponse.json({ error: "App not supported yet" }, { status: 400 });
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
