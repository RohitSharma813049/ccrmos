import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SequenceEnrollment from '@/modules/marketing/schemas/SequenceEnrollment';
import Sequence from '@/modules/marketing/schemas/Sequence';
import Lead from '@/modules/leads/schemas/Lead';

// This endpoint should be hit by a Cron Job (e.g., every 5 minutes)
export async function GET(req: Request) {
  try {
    // In production, add a CRON_SECRET check here to ensure only your cron engine can hit this
    
    await dbConnect();

    const now = new Date();
    
    // 1. Find all active enrollments where the execution date has passed
    const pendingEnrollments = await SequenceEnrollment.find({
      status: "ACTIVE",
      nextExecutionDate: { $lte: now }
    }).limit(50); // Batch process 50 at a time

    if (pendingEnrollments.length === 0) {
      return NextResponse.json({ message: "No sequences to process" });
    }

    let processedCount = 0;

    for (const enrollment of pendingEnrollments) {
      try {
        const sequence = await Sequence.findById(enrollment.sequenceId);
        const lead = await Lead.findById(enrollment.leadId);

        if (!sequence || !sequence.isActive || !lead) {
          enrollment.status = "FAILED";
          enrollment.errorMessage = "Sequence or Lead not found/inactive";
          await enrollment.save();
          continue;
        }

        const step = sequence.steps[enrollment.currentStepIndex];
        
        if (!step) {
           // Sequence is completed
           enrollment.status = "COMPLETED";
           await enrollment.save();
           continue;
        }

        // 2. Execute the Step
        if (step.actionType === "EMAIL") {
          // In real production, this pushes to the MockQueue or Resend API
          console.log(`[Sequence] Sending EMAIL to ${lead.email}: ${step.subject}`);
        } else if (step.actionType === "WHATSAPP") {
          console.log(`[Sequence] Sending WHATSAPP to ${lead.phone}`);
        } else if (step.actionType === "SMS") {
          console.log(`[Sequence] Sending SMS to ${lead.phone}`);
        }
        
        // Log to timeline
        if (step.actionType !== "DELAY") {
            await Lead.findByIdAndUpdate(lead._id, {
                $push: {
                  activities: {
                    type: step.actionType,
                    description: `Automated Sequence (${sequence.name}): Step ${enrollment.currentStepIndex + 1}`,
                    timestamp: new Date()
                  }
                }
            });
        }

        // 3. Advance the State Machine
        const nextStepIndex = enrollment.currentStepIndex + 1;
        const nextStep = sequence.steps[nextStepIndex];

        if (nextStep) {
          // Calculate when the NEXT step should run
          const delayMs = (nextStep.delayInDays || 0) * 24 * 60 * 60 * 1000;
          enrollment.currentStepIndex = nextStepIndex;
          enrollment.nextExecutionDate = new Date(Date.now() + delayMs);
          
          // If the next step is just a DELAY, we could recursively process or just let it sit
        } else {
          enrollment.status = "COMPLETED";
        }

        await enrollment.save();
        processedCount++;

      } catch (err: any) {
        enrollment.status = "FAILED";
        enrollment.errorMessage = err.message;
        await enrollment.save();
      }
    }

    return NextResponse.json({ message: "Sweep complete", processed: processedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
