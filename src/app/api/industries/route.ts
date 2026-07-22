import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Industry from "@/modules/settings/schemas/Industry";
import { getSession } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const industries = await Industry.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(industries);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const industry = await Industry.create({
      name: data.name,
      description: data.description,
      isActive: true,
    });
    
    return NextResponse.json(industry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
