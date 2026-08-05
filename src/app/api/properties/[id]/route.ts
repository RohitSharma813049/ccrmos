import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/modules/properties/schemas/Property';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const property = await Property.findOne({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    }).populate('projectId', 'name');

    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const body = await req.json();
    const { _id, ...updateData } = body;

    const property = await Property.findOneAndUpdate(
      { _id: params.id, ...buildTenantQuery(user) },
      updateData,
      { new: true }
    );

    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    return NextResponse.json({ property });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    
    const property = await Property.findOneAndDelete({ 
      _id: params.id, 
      ...buildTenantQuery(user) 
    });

    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
