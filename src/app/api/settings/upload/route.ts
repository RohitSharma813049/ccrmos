import { NextResponse } from 'next/server';
import { requireAuthenticatedUser, requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission(PERMISSIONS.WHITE_LABEL_MANAGEMENT);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/svg+xml"]);
    const maxSize = 2 * 1024 * 1024;
    if (!allowedTypes.has(file.type) || file.size > maxSize) {
      return NextResponse.json({ error: "Only JPEG, PNG, or SVG files up to 2 MB are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure the public/uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `logo_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save to public/uploads
    fs.writeFileSync(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
