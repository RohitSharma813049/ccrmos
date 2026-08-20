import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AppIntegration from '@/modules/core/schemas/AppIntegration';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/marketplace?error=${encodeURIComponent(error)}`, req.url));
    }

    if (!code || !stateStr) {
      return NextResponse.redirect(new URL('/marketplace?error=missing_oauth_params', req.url));
    }

    const state = JSON.parse(decodeURIComponent(stateStr));
    const { companyId, userId, appName } = state;

    await dbConnect();

    // In a real production environment, you would now make an HTTP POST request to 
    // the provider's token endpoint (e.g. https://slack.com/api/oauth.v2.access)
    // passing the `code` and your `client_secret` to get the actual access_token.
    // e.g. const tokenRes = await axios.post('https://slack.com/api/oauth.v2.access', { code, client_secret })
    
    // For this architecture demo, we mock the token swap:
    const mockAccessToken = `mock_oauth_access_token_${appName}_${Date.now()}`;
    const mockRefreshToken = `mock_oauth_refresh_token_${Date.now()}`;
    
    // Upsert the Integration record
    await AppIntegration.findOneAndUpdate(
      { companyId, appName },
      {
        $set: {
          status: "ACTIVE",
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
          tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
          installedBy: userId,
          metadata: {
            connectedAt: new Date(),
            // Mock specific metadata
            ...(appName === 'SLACK' && { webhookUrl: "https://example.com/mock-slack-webhook-endpoint" })
          }
        }
      },
      { new: true, upsert: true }
    );

    // Redirect the user back to the marketplace dashboard with a success message
    return NextResponse.redirect(new URL(`/marketplace?success=true&app=${appName}`, req.url));
  } catch (error: any) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(new URL('/marketplace?error=server_error', req.url));
  }
}
