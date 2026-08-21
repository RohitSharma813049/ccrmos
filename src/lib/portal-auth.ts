import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.PORTAL_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-portal-development';
const key = new TextEncoder().encode(SECRET_KEY);

export interface PortalSession {
  customerId: string;
  companyId: string;
  email: string;
}

export async function createPortalToken(payload: PortalSession) {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
  
  return jwt;
}

export async function verifyPortalToken(token: string): Promise<PortalSession | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as PortalSession;
  } catch (error) {
    return null;
  }
}

export async function getPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('portal_token')?.value;
  
  if (!token) return null;
  
  return await verifyPortalToken(token);
}

export async function setPortalCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('portal_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearPortalCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('portal_token');
}
