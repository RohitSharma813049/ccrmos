import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Webhook from "@/modules/settings/schemas/Webhook";
import { getSession } from "@/lib/auth-utils";
import crypto from "crypto";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    // Only founders and platform owners should manage Webhooks
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = {};
    if (user.hierarchyLevel === 2) {
      query.founderId = user.id;
    }

    const webhooks = await Webhook.find(query).sort({ createdAt: -1 });
    
    // Mask secrets before returning to client for security
    const maskedWebhooks = webhooks.map(w => ({
      _id: w._id,
      name: w.name,
      endpointUrl: w.endpointUrl,
      events: w.events,
      isActive: w.isActive,
      createdAt: w.createdAt,
      maskedSecret: `${w.secret.substring(0, 4)}...${w.secret.substring(w.secret.length - 4)}`
    }));

    return NextResponse.json({ webhooks: maskedWebhooks });
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
    
    if (!body.name || !body.endpointUrl) {
      return NextResponse.json({ error: "Name and Endpoint URL are required" }, { status: 400 });
    }

    // Generate a secure signing secret
    const rawSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
    
    const newWebhook = await Webhook.create({
      name: body.name,
      endpointUrl: body.endpointUrl,
      events: body.events || ["*"],
      secret: rawSecret,
      founderId: user.hierarchyLevel === 2 ? user.id : user.founderId,
      companyId: user.companyId
    });

    // Return the raw secret ONLY ONCE.
    return NextResponse.json({ 
      webhook: {
        _id: newWebhook._id,
        name: newWebhook.name,
        endpointUrl: newWebhook.endpointUrl,
        events: newWebhook.events,
        isActive: newWebhook.isActive,
        createdAt: newWebhook.createdAt,
        secret: rawSecret // IMPORTANT: Sent to client just this once
      } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = session.user as any;
    
    if (user.hierarchyLevel > 2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const query: any = { _id: id };
    if (user.hierarchyLevel === 2) {
      query.founderId = user.id;
    }

    const webhook = await Webhook.findOneAndUpdate(query, { isActive }, { new: true });
    
    if (!webhook) {
       return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, isActive: webhook.isActive });
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

    await Webhook.findOneAndDelete(query);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
