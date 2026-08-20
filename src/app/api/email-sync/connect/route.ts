import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailSyncConfig from '@/modules/core/schemas/EmailSyncConfig';
import { requireAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();
    
    const { provider, emailAddress, refreshToken } = await req.json();

    if (!provider || !emailAddress) {
      return NextResponse.json({ error: "Provider and email address are required" }, { status: 400 });
    }

    // In a real application, this endpoint would either:
    // 1. Generate an OAuth redirect URL for Gmail/Outlook
    // 2. Receive the OAuth callback code and exchange it for a refresh token
    
    // For this architecture demo, we will simulate the successful connection
    
    const config = await EmailSyncConfig.findOneAndUpdate(
      { agentId: user.id },
      {
        companyId: user.companyId,
        provider,
        emailAddress,
        refreshToken: refreshToken || "mock_oauth_refresh_token_xyz123",
        syncStatus: "ACTIVE",
        lastSyncedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Inbox connected successfully", config });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
