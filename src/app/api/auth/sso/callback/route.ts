import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SSOConfig from '@/modules/core/schemas/SSOConfig';
import User from '@/modules/users/schemas/User';

export async function POST(req: Request) {
  try {
    // Okta/Azure POSTs the SAMLResponse to this endpoint
    const formData = await req.formData();
    const samlResponse = formData.get('SAMLResponse') as string;
    
    if (!samlResponse) {
      return NextResponse.redirect(new URL('/login?error=missing_saml', req.url));
    }

    await dbConnect();

    // 1. In production, use a SAML library to parse the XML, verify the signature 
    // against `ssoConfig.x509Cert`, and extract the NameID (email) and attributes.
    // For architecture demo, we mock the extraction:
    
    const mockExtractedEmail = "agent@enterprise.com"; 
    const mockDomain = mockExtractedEmail.split('@')[1];

    // 2. Validate the tenant exists
    const config = await SSOConfig.findOne({ domain: mockDomain, isActive: true });
    
    if (!config) {
       return NextResponse.redirect(new URL('/login?error=invalid_tenant', req.url));
    }

    // 3. Find or Provision User
    let user = await User.findOne({ email: mockExtractedEmail, companyId: config.companyId });

    if (!user) {
      if (!config.autoProvisionUsers) {
        return NextResponse.redirect(new URL('/login?error=user_not_provisioned', req.url));
      }

      // Just-in-Time (JIT) Provisioning
      user = await User.create({
        email: mockExtractedEmail,
        companyId: config.companyId,
        role: config.defaultRoleId,
        isActive: true,
        // Optional SAML attributes like firstName, lastName could map here
      });
    }

    if (!user.isActive) {
      return NextResponse.redirect(new URL('/login?error=account_disabled', req.url));
    }

    // 4. Create Next.js Authentication Session
    // In production, you would generate a JWT or Iron-Session here and set it in a cookie.
    
    const token = "mock_jwt_token_" + user._id;

    // 5. Redirect to CRM Dashboard
    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.cookies.set('crm_session', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error("SSO Callback Error:", error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
