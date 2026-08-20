import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ETLConfig from '@/modules/core/schemas/ETLConfig';
import Lead from '@/modules/leads/schemas/Lead';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// To be called by a nightly Cron job
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all active ETL configurations
    const configs = await ETLConfig.find({ isActive: true });
    
    let processedTenants = 0;

    for (const config of configs) {
      // Find leads updated since the last export (or all if never exported)
      const query: any = { companyId: config.companyId };
      if (config.lastExportDate) {
        query.updatedAt = { $gt: config.lastExportDate };
      }

      // Stream the massive dataset from MongoDB (lean for performance)
      const leads = await Lead.find(query).lean();
      
      if (leads.length === 0) continue;

      // Flatten data into NDJSON (Newline Delimited JSON) for Snowflake/BigQuery ingestion
      const ndjson = leads.map(lead => JSON.stringify({
        id: lead._id?.toString(),
        displayId: (lead as any).displayId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        createdAt: (lead as any).createdAt,
        updatedAt: (lead as any).updatedAt,
        budget: (lead as any).budget || null
      })).join('\n');

      if (config.destination === 'AWS_S3') {
        const s3Client = new S3Client({
          region: config.region,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
          }
        });

        const filename = `crm_export/leads_${config.companyId}_${Date.now()}.ndjson`;

        await s3Client.send(new PutObjectCommand({
          Bucket: config.bucketName,
          Key: filename,
          Body: ndjson,
          ContentType: 'application/x-ndjson'
        }));
      }

      // Update the last export timestamp
      config.lastExportDate = new Date();
      await config.save();
      
      processedTenants++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Nightly ETL Pipeline Completed. Processed ${processedTenants} tenants.` 
    });

  } catch (error: any) {
    console.error("ETL Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
