import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { calculateInvoice } from '@/lib/invoice-calculator';

export async function POST(req: Request) {
  try {
    await requireAuthenticatedUser();
    const body = await req.json();

    const result = calculateInvoice(body);
    return NextResponse.json({ calculation: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate invoice" }, { status: 400 });
  }
}
