import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Company from "@/modules/companies/schemas/Company";
import User from "@/modules/users/schemas/User";
import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";

// PUT /api/companies/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    const { name, adminEmail, plan, usersQuota, status, industryId, enabledModules } = await req.json();
    
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { 
        name, 
        adminEmail, 
        plan, 
        usersQuota, 
        status, 
        industryId: industryId === "" ? null : industryId, 
        enabledModules 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Tenant updated successfully.", company: updatedCompany }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/companies/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_COMPANIES);
    
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const { id } = await params;
    
    // HARD DELETE for initial implementation
    const company = await Company.findByIdAndDelete(id);
    
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    
    // Cascade delete all data belonging to this company across all collections
    const collectionsToClear = [
      "users", "roles", "customers", "leads", "projects", "tasks", "invoices", 
      "orders", "departments", "teams", "custommodules", "dynamicfields",
      "dynamicrecords", "customrecords", "pipelines", "leadstages", "leadstatuses",
      "properties", "apikeys", "webhooks", "integrationlinks", "integrationsettings",
      "campaignsettings", "notifications", "partners", "forms", "formsubmissions",
      "systemsettings"
    ];

    if (mongoose.connection.db) {
      for (const collectionName of collectionsToClear) {
        try {
          // Delete records where companyId is a string
          await mongoose.connection.db.collection(collectionName).deleteMany({ companyId: id });
          // Delete records where companyId is an ObjectId
          if (mongoose.Types.ObjectId.isValid(id)) {
            await mongoose.connection.db.collection(collectionName).deleteMany({ companyId: new mongoose.Types.ObjectId(id) });
          }
        } catch (e) {
          console.error(`Failed to clear collection ${collectionName} for tenant ${id}`, e);
        }
      }
    } else {
      // Fallback if db is not immediately accessible, at least delete users
      await User.deleteMany({ companyId: id });
    }
    
    // Delete files from Cloudflare R2 if configured
    if (process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME) {
      try {
        const s3Client = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });
        
        const prefix = `uploads/${id}/`;
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;

        while (isTruncated) {
          const listCommand = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
            Prefix: prefix,
            ContinuationToken: continuationToken
          });
          const listRes = await s3Client.send(listCommand);
          
          if (listRes.Contents && listRes.Contents.length > 0) {
            const deleteCommand = new DeleteObjectsCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Delete: {
                Objects: listRes.Contents.map(c => ({ Key: c.Key }))
              }
            });
            await s3Client.send(deleteCommand);
          }
          isTruncated = !!listRes.IsTruncated;
          continuationToken = listRes.NextContinuationToken;
        }
      } catch (e) {
        console.error(`Failed to delete Cloudflare R2 files for tenant ${id}`, e);
      }
    }
    
    // Delete files from local storage (fallback)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', id.toString());
      await fs.rm(uploadDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore if directory doesn't exist
    }
    
    return NextResponse.json({ message: "Tenant and all associated data deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/companies/[id] error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
