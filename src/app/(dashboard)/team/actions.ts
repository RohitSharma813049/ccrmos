'use server'

import dbConnect from "@/lib/db";
import User from "@/modules/users/schemas/User";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getTeamMembers() {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  
  const filter: any = {};
  if (userCompanyId) {
    filter.$or = [
      { companyId: userCompanyId },
      { founderId: userCompanyId }
    ];
  }

  const users = await User.find(filter)
    .populate('role', 'name')
    .sort({ createdAt: -1 })
    .lean();
  
  // Transform users for the client
  const transformed = users.map(user => {
    let status = 'Suspended';
    if (user.isActive) {
      status = user.name ? 'Active' : 'Invited';
    }
    
    return {
      id: user._id.toString(),
      name: user.name || 'Pending Invite',
      email: user.email,
      role: (user.role as any)?.name || 'Agent',
      status,
      lastActive: (user as any).updatedAt ? new Date((user as any).updatedAt).toLocaleDateString() : 'Never'
    };
  });
  
  return transformed;
}

export async function inviteTeamMember(data: { email: string; role: string }) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  const founderId = (session.user as any).impersonatedFounderId || session.user.id;

  // Check if user already exists
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new Error("User already exists with this email");
  }

  // Create a pending user invite
  const newUser = new User({
    email: data.email,
    companyId: userCompanyId,
    founderId: founderId,
    isActive: true,
    // Typically you'd send an email invite here
  });

  await newUser.save();
  
  revalidatePath('/dashboard/team');
  revalidatePath('/team');
  
  return { success: true };
}

export async function toggleSuspendMember(id: string) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await User.findById(id);
  if (!user) throw new Error("User not found");
  
  // Prevent suspending self
  if (user._id.toString() === session.user.id) {
    throw new Error("Cannot suspend yourself");
  }

  user.isActive = !user.isActive;
  await user.save();
  
  revalidatePath('/dashboard/team');
  revalidatePath('/team');
  
  return { success: true };
}
