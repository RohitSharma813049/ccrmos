import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/modules/customers/schemas/Customer';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuthenticatedUser();
    await dbConnect();

    const { action } = await req.json(); // "enable", "disable", "reset"

    const customer = await Customer.findOne({ _id: params.id, companyId: user.companyId });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (action === 'disable') {
      customer.hasPortalAccess = false;
      customer.portalPassword = undefined;
      await customer.save();
      return NextResponse.json({ success: true, message: 'Portal access disabled' });
    }

    if (action === 'enable' || action === 'reset') {
      const generatedPassword = crypto.randomBytes(6).toString('hex'); // 12 char random string
      
      customer.hasPortalAccess = true;
      customer.portalPassword = generatedPassword;
      await customer.save();

      // In a real app, you would send an email here with the generated password.
      return NextResponse.json({ 
        success: true, 
        message: 'Portal access enabled',
        password: generatedPassword // Return it so the UI can display it once
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
