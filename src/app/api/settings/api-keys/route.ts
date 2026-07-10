import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ApiKey from "@/modules/settings/schemas/ApiKey";
import { getSession } from "@/lib/auth-utils";
import crypto from "crypto";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    // Only founders and platform owners should manage API keys
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = {};
    if (user.hierarchyLevel === 2) {
      query.founderId = user.id;
    }

    const keys = await ApiKey.find(query).sort({ createdAt: -1 });
    
    // Mask keys before returning to client for security
    const maskedKeys = keys.map(k => ({
      _id: k._id,
      name: k.name,
      isActive: k.isActive,
      createdAt: k.createdAt,
      maskedKey: `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`
    }));

    return NextResponse.json({ keys: maskedKeys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate a secure API key
    const rawKey = `crm_live_${crypto.randomBytes(24).toString("hex")}`;
    
    const newApiKey = await ApiKey.create({
      name: body.name,
      key: rawKey,
      founderId: user.hierarchyLevel === 2 ? user.id : user.founderId,
      companyId: user.companyId
    });

    // Return the raw key ONLY ONCE.
    return NextResponse.json({ 
      apiKey: {
        _id: newApiKey._id,
        name: newApiKey.name,
        isActive: newApiKey.isActive,
        createdAt: newApiKey.createdAt,
        key: rawKey // IMPORTANT: Sent to client just this once
      } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const query: any = { _id: id };
    if (user.hierarchyLevel === 2) {
      query.founderId = user.id;
    }

    await ApiKey.findOneAndDelete(query);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
