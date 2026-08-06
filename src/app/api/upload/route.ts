import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

let s3Client: S3Client | null = null;
if (process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const randomHash = crypto.randomBytes(16).toString('hex');
    const fileName = `uploads/${user.companyId || 'global'}/${randomHash}.${fileExtension}`;

    let publicUrl = '';

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);
      publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    } else {
      // Fallback to local storage
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', (user.companyId || 'global').toString());
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, `${randomHash}.${fileExtension}`);
      await fs.writeFile(filePath, buffer);
      publicUrl = `/${fileName}`;
    }

    return NextResponse.json({ url: publicUrl, name: file.name, type: file.type });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
