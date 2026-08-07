import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import RecycleBin from "@/modules/settings/schemas/RecycleBin";
import mongoose from "mongoose";

// GET /api/settings/recycle-bin
export async function GET(req: Request) {
  try {
    const auth = await requirePermission("");
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const items = await RecycleBin.find({ companyId: auth.companyId }).sort({ deletedAt: -1 }).lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/settings/recycle-bin error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch recycle bin items" }, { status: 500 });
  }
}

// DELETE /api/settings/recycle-bin?ids=...
export async function DELETE(req: Request) {
  try {
    const auth = await requirePermission("");
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const ids = url.searchParams.get("ids")?.split(",").filter(Boolean);
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
    }

    await dbConnect();
    await RecycleBin.deleteMany({
      companyId: auth.companyId,
      _id: { $in: ids }
    });

    return NextResponse.json({ message: "Items permanently deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/settings/recycle-bin error:", error);
    return NextResponse.json({ error: error.message || "Failed to permanently delete items" }, { status: 500 });
  }
}
