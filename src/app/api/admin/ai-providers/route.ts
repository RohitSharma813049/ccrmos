import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AIProvider from "@/modules/settings/schemas/AIProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    await dbConnect();
    const providers = await AIProvider.find().sort({ createdAt: -1 });
    return NextResponse.json({ providers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).hierarchyLevel !== 1) {
      return NextResponse.json({ error: "Unauthorized. Platform Owner only." }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const provider = new AIProvider({
      name: body.name,
      description: body.description,
      endpointUrl: body.endpointUrl,
      apiKey: body.apiKey,
      defaultModel: body.defaultModel,
      isActive: body.isActive ?? true,
      icon: body.icon,
      color: body.color,
      allowTenantOverride: body.allowTenantOverride ?? true,
    });

    await provider.save();
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
