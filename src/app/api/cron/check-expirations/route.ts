import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/modules/companies/schemas/Company";

// Simple cron to mark companies past_due if Razorpay doesn't webhook
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // In a real Razorpay implementation, you'd check the subscription end date.
    // For now, if we have an internal `subscriptionEndDate` field, we'd check it.
    // Since we don't, we will assume this endpoint will be expanded when Razorpay dates are synced.
    
    return NextResponse.json({ success: true, message: "Checked expirations (mock)" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
