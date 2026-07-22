import { NextResponse } from "next/server";
import { emailQueue } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Add a job to the queue
    const job = await emailQueue.add("sendEmail", { to, subject, body });

    return NextResponse.json({
      success: true,
      message: "Job added to queue",
      jobId: job.id
    }, { status: 200 });

  } catch (error) {
    console.error("Error adding job to queue:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
