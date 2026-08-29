'use server'

import dbConnect from "@/lib/db";
import Task from "@/modules/tasks/schemas/Task";
import User from "@/modules/users/schemas/User";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getTasks() {
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

  // Populate assignee info
  // Must ensure User model is loaded for populate
  if (!User) {
    console.warn("User model not loaded");
  }

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
  
  return JSON.parse(JSON.stringify(tasks));
}

export async function createTask(data: any) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  const userId = session.user.id;

  const task = new Task({
    ...data,
    companyId: userCompanyId,
    founderId: (session.user as any).impersonatedFounderId || userId,
    assignee: data.assignee || userId
  });

  await task.save();
  revalidatePath('/dashboard/tasks');
  revalidatePath('/tasks');
  
  return JSON.parse(JSON.stringify(task));
}

export async function toggleTaskStatus(id: string) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const task = await Task.findById(id);
  if (!task) throw new Error("Not found");
  
  task.status = task.status === 'Open' ? 'Completed' : 'Open';
  await task.save();
  
  revalidatePath('/dashboard/tasks');
  revalidatePath('/tasks');
  
  return JSON.parse(JSON.stringify(task));
}