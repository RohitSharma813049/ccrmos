import { NextResponse } from "next/server";
import mongoose from "mongoose";
import IndustryTemplate from "@/modules/settings/schemas/IndustryTemplate";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.GLOBAL_SETTINGS);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const templates = await IndustryTemplate.find().sort({ createdAt: -1 });
    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.GLOBAL_SETTINGS);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const body = await req.json();
    const { name, description, modules, fields } = body;
    
    if (!name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }
    
    // Automatically generate default mock modules and fields if none are provided
    const defaultModules = modules && modules.length > 0 ? modules : [
      { name: "Leads", active: true, fields: [{ name: "Source", type: "text", required: true }] },
      { name: "Projects", active: true, fields: [{ name: "Status", type: "select", options: ["Open", "Closed"] }] }
    ];

    const defaultFields = fields && fields.length > 0 ? fields : [
      { name: "Industry Type", type: "text", required: false },
      { name: "Estimated Budget", type: "number", required: false }
    ];

    const newTemplate = await IndustryTemplate.create({
      name,
      description: description || "",
      modules: defaultModules,
      fields: defaultFields
    });
    
    return NextResponse.json({ message: "Template created successfully.", template: newTemplate }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
