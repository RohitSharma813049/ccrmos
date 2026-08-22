import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/modules/tickets/schemas/Ticket';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import Customer from '@/modules/customers/schemas/Customer';

export async function GET(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    // Fetch tickets and populate customer name
    const tickets = await Ticket.find({ companyId })
      .populate('customerId', 'name email')
      .populate('assignedUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("Fetch Tickets Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const companyId = user.companyId || user.impersonatedFounderId;
    await dbConnect();

    const body = await req.json();

    // In a real app, customerId might be passed in, or we look it up by email
    let customerId = body.customerId;

    if (!customerId && body.customerEmail) {
      // Create or find customer
      let customer = await Customer.findOne({ companyId, email: body.customerEmail });
      if (!customer) {
        customer = await Customer.create({
          companyId,
          name: body.customerName || 'Unknown Customer',
          email: body.customerEmail,
        });
      }
      customerId = customer._id;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID or Email is required" }, { status: 400 });
    }

    const ticket = await Ticket.create({
      companyId,
      customerId,
      subject: body.subject,
      description: body.description,
      priority: body.priority || 'Medium',
      createdBy: user._id, // User who logged the ticket manually
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Create Ticket Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
