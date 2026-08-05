import { NextResponse } from 'next/server';
import { requireAuthenticatedUser, requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

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
    
    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const randomHash = crypto.randomBytes(16).toString('hex');
    const filename = `branding/${user.companyId || 'global'}/logo_${randomHash}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the public URL
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
