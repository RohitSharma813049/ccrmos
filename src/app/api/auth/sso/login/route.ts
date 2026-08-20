import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SSOConfig from '@/modules/core/schemas/SSOConfig';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.redirect(new URL('/login?error=invalid_email', req.url));
    }

    const domain = email.split('@')[1].toLowerCase();

    // Find if the company has an active SSO config for this domain
    const ssoConfig = await SSOConfig.findOne({ domain, isActive: true });

    if (!ssoConfig) {
      // No SSO configured, redirect back to standard password login
      return NextResponse.redirect(new URL(`/login?email=${encodeURIComponent(email)}`, req.url));
    }

    // In a real application, you would use a SAML library like 'samlify' or 'passport-saml'
    // to generate a signed SAMLRequest XML payload and redirect to the IdP.
    // e.g. const samlRequest = generateSAMLRequest(ssoConfig);
    // return NextResponse.redirect(`${ssoConfig.idpSsoUrl}?SAMLRequest=${samlRequest}`);

    // For this architecture, we mock the redirect to the Identity Provider
    const redirectUrl = `${ssoConfig.idpSsoUrl}?SAMLRequest=MOCK_BASE64_SAML_REQUEST&RelayState=${encodeURIComponent(req.url)}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
