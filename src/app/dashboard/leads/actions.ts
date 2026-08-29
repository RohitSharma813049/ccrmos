'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Lead from '@/modules/leads/schemas/Lead';

export async function getLeads() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const user = session.user as any;
  const founderId = user.impersonatedFounderId || user.founderId;
  const companyId = user.impersonatedCompanyId || user.companyId;

  const query: any = {};
  if (founderId) query.founderId = founderId;
  if (companyId) query.companyId = companyId;

  // If user is just an agent (level > 2), they might only see their assigned leads
  if (user.hierarchyLevel > 2) {
    query.assignedUserId = user.id;
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
  
  // Convert _id to string for Client Components
  return leads.map((lead: any) => ({
    ...lead,
    _id: lead._id.toString(),
    companyId: lead.companyId?.toString(),
    founderId: lead.founderId?.toString(),
    stageId: lead.stageId?.toString(),
    createdBy: lead.createdBy?.toString(),
    createdAt: lead.createdAt?.toISOString(),
    updatedAt: lead.updatedAt?.toISOString(),
  }));
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const lead = await Lead.findByIdAndUpdate(
    leadId, 
    { status: newStatus },
    { new: true }
  ).lean();

  return lead;
}

export async function createLead(data: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const user = session.user as any;
  
  const lead = await Lead.create({
    ...data,
    founderId: user.impersonatedFounderId || user.founderId,
    companyId: user.impersonatedCompanyId || user.companyId,
    createdBy: user.id,
    assignedUserId: user.id
  });

  return {
    ...lead.toObject(),
    _id: lead._id.toString(),
  };
}