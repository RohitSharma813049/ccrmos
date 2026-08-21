import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
import { createPortalToken, setPortalCookie } from '@/lib/portal-auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const customer = await Customer.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!customer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!customer.hasPortalAccess) {
      return NextResponse.json({ error: 'Portal access is not enabled for this account' }, { status: 403 });
    }

    if (customer.portalPassword !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    customer.portalLastLogin = new Date();
    await customer.save();

    const token = await createPortalToken({
      customerId: customer._id.toString(),
      companyId: customer.companyId?.toString() || '',
      email: customer.email || ''
    });

    await setPortalCookie(token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
