import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ApiKey, { generateApiKey } from '@/modules/core/schemas/ApiKey';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    // Requires high-level access
    await requirePermission('DeveloperSettings', 'view'); 

    await dbConnect();

    const keys = await ApiKey.find({ companyId: user.companyId })
      .select('-key') // Hide the full key in GET requests for security
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ keys });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('DeveloperSettings', 'edit'); 
    await dbConnect();
    
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newKey = generateApiKey();

    const apiKey = await ApiKey.create({
      companyId: user.companyId,
      name,
      key: newKey, // Return it once
      createdBy: user.id
    });

    return NextResponse.json({ apiKey });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') || error.message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
