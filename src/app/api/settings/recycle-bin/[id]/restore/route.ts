import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { requirePermission } from "@/lib/auth-utils";
import RecycleBin from "@/modules/settings/schemas/RecycleBin";
import mongoose from "mongoose";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requirePermission("");
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await dbConnect();
    
    const binItem = await RecycleBin.findOne({
      _id: id,
      companyId: auth.companyId
    });

    if (!binItem) {
      return NextResponse.json({ error: "Item not found in Recycle Bin" }, { status: 404 });
    }

    // Insert back to original collection
    const collection = mongoose.connection.db?.collection(binItem.collectionName);
    if (!collection) {
      return NextResponse.json({ error: "Original collection not found" }, { status: 500 });
    }

    try {
      await collection.insertOne(binItem.documentData);
    } catch (e: any) {
      // If duplicate key error on restore (meaning a document with the same ID already exists)
      if (e.code === 11000) {
        // It already exists, maybe they recreated it or we soft-deleted twice
        console.warn(`Item ${binItem.originalId} already exists in ${binItem.collectionName}`);
      } else {
        throw e;
      }
    }

    // Remove from Recycle Bin
    await RecycleBin.findByIdAndDelete(id);

    return NextResponse.json({ message: "Item restored successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/settings/recycle-bin/[id]/restore error:", error);
    return NextResponse.json({ error: error.message || "Failed to restore item" }, { status: 500 });
  }
}
