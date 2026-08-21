import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/modules/tasks/schemas/Task';
import Lead from '@/modules/leads/schemas/Lead';
import Company from '@/modules/companies/schemas/Company';
import { evaluateWorkflows } from '@/modules/automation/services/workflow.service';
import CallLog from '@/modules/core/schemas/CallLog';
import mongoose from 'mongoose';

export async function GET(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    await dbConnect();
    const { companyId } = await params;
    
    const company = await Company.findById(companyId).select('name logo');
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get meetings for the next 14 days to calculate availability
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    const meetings = await Task.find({
      companyId,
      type: 'meeting',
      dueDate: { $gte: startDate, $lte: endDate }
    }).select('dueDate');

    // Return the company info and booked slots
    return NextResponse.json({ 
      company,
      bookedSlots: meetings.map(m => m.dueDate)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    await dbConnect();
    const { companyId } = await params;
    const body = await req.json();
    const { name, email, phone, date, time } = body; // date is ISO string, time is HH:MM

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Parse the requested date and time
    const meetingDate = new Date(date);
    const [hours, minutes] = time.split(':');
    meetingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // 1. Find or create lead
    let lead = await Lead.findOne({ companyId, email });
    if (!lead && phone) {
       lead = await Lead.findOne({ companyId, phone });
    }

    if (!lead) {
      lead = await Lead.create({
        companyId,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        email,
        phone,
        status: 'New',
        source: 'Website Booking'
      });
      // Trigger new lead workflows
      evaluateWorkflows(companyId, "Lead Created", lead._id.toString(), lead.toObject()).catch(console.error);
    }

    // 2. Create the Meeting Task
    const meetingTask = await Task.create({
      companyId,
      title: `Introductory Call with ${name}`,
      description: `Meeting booked via public scheduling link. \nContact: ${email} | ${phone}`,
      type: 'meeting',
      status: 'pending',
      priority: 'high',
      dueDate: meetingDate,
      leadId: lead._id,
      assignedTo: company.founderId // Assign to founder by default
    });

    // 3. Log interaction
    await CallLog.create({
      companyId,
      leadId: lead._id,
      channel: 'Email', // Fallback channel category
      direction: 'inbound',
      status: 'completed',
      notes: `Customer booked a meeting for ${meetingDate.toLocaleString()}`,
      toNumber: company.phone || "System",
      fromNumber: phone || email
    });

    return NextResponse.json({ success: true, message: 'Meeting booked successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
