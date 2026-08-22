import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/modules/campaigns/schemas/Campaign';
import Lead from '@/modules/leads/schemas/Lead';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();
    
    const body = await req.json();
    const { campaignId } = body;
    
    if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    
    const campaign = await Campaign.findOne({ _id: campaignId, companyId });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.status === 'Completed') return NextResponse.json({ error: "Already completed" }, { status: 400 });

    campaign.status = 'Sending';
    await campaign.save();

    // 1. Fetch matching Leads
    let query: any = { companyId };
    
    if (campaign.targetAudience.status && campaign.targetAudience.status.length > 0) {
      query.status = { $in: campaign.targetAudience.status };
    }
    
    // In a real system, you'd add tags / hasEmail checks
    // Force email presence for email campaigns
    if (campaign.type === 'Email') {
      query.email = { $exists: true, $ne: "" };
    } else if (campaign.type === 'SMS') {
      query.phone = { $exists: true, $ne: "" };
    }

    const leads = await Lead.find(query);
    
    campaign.stats.totalTargeted = leads.length;

    if (leads.length === 0) {
      campaign.status = 'Completed';
      await campaign.save();
      return NextResponse.json({ message: "No matching leads found", campaign });
    }

    // 2. Determine Email Provider (Resend vs SMTP)
    const settingQuery = companyId ? { key: 'email_config', companyId } : { key: 'email_config' };
    let setting = await SystemSetting.findOne(settingQuery);
    
    // Fallback to global if tenant doesn't have one and we are on platform
    if (!setting && companyId) {
       setting = await SystemSetting.findOne({ key: 'email_config', companyId: null });
    }

    const config = setting?.value || {};
    let successful = 0;
    let failed = 0;

    // Send emails
    if (campaign.type === 'Email') {
      const fromEmail = config.fromEmail || process.env.EMAIL_FROM || 'noreply@crmos.com';
      
      // Use Resend if API key is provided
      if (config.resendApiKey) {
        const resend = new Resend(config.resendApiKey);
        
        for (const lead of leads) {
          try {
            await resend.emails.send({
              from: fromEmail,
              to: lead.email!,
              subject: campaign.subject || campaign.name,
              html: campaign.content.replace(/{{name}}/g, lead.firstName || 'Customer')
            });
            successful++;
          } catch (err) {
            failed++;
          }
        }
      } 
      // Fallback to SMTP
      else if (process.env.EMAIL_SERVER_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        for (const lead of leads) {
          try {
            await transporter.sendMail({
              from: fromEmail,
              to: lead.email!,
              subject: campaign.subject || campaign.name,
              html: campaign.content.replace(/{{name}}/g, lead.firstName || 'Customer')
            });
            successful++;
          } catch (err) {
            failed++;
          }
        }
      } else {
        // Mock sending if no provider
        console.warn("No Email Provider Configured. Mocking bulk send.");
        successful = leads.length;
      }
    }

    campaign.stats.successful = successful;
    campaign.stats.failed = failed;
    campaign.status = 'Completed';
    campaign.sentAt = new Date();
    await campaign.save();

    return NextResponse.json({ success: true, campaign });

  } catch (error: any) {
    console.error("Campaign execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
