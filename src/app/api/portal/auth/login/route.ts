import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const lead = await Lead.findOne({ email: email.toLowerCase(), hasPortalAccess: true });

    if (!lead || !lead.portalPasswordHash) {
      return NextResponse.json({ error: "Invalid credentials or portal access disabled" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, lead.portalPasswordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // In production, sign a JWT for the client portal.
    const token = `client_portal_token_${lead._id}`;
    
    const response = NextResponse.json({ 
      message: "Logged in successfully",
      leadId: lead._id,
      name: `${lead.firstName} ${lead.lastName}`
    });
    
    response.cookies.set('portal_session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
