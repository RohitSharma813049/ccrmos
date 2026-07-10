import { NextResponse } from 'next/server';
import { runScheduledTasks } from '@/modules/automation/services/cron.service';

/**
 * Endpoint triggered by Vercel Cron.
 * Securely protected by CRON_SECRET environment variable.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Check standard Vercel Cron Secret (passed as Bearer token)
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      console.warn("[CRON] Unauthorized attempt to run cron jobs.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("[CRON] Executing scheduled batch tasks...");
    
    // Run background jobs
    const result = await runScheduledTasks();

    return NextResponse.json({ 
      success: true, 
      message: 'Scheduled tasks completed.',
      data: result
    }, { status: 200 });

  } catch (error: any) {
    console.error("[CRON] Failed executing cron jobs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
