'use server'

import dbConnect from "@/lib/db";
import Project from "@/modules/projects/schemas/Project";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  
  // Standard tenancy filter
  const filter: any = {};
  if (userCompanyId) {
    filter.$or = [
      { companyId: userCompanyId },
      { founderId: userCompanyId }
    ];
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
  
  return JSON.parse(JSON.stringify(projects));
}

export async function createProject(data: any) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userCompanyId = (session.user as any).companyId || (session.user as any).impersonatedFounderId;
  const userId = session.user.id;

  const project = new Project({
    ...data,
    companyId: userCompanyId,
    createdBy: userId,
    founderId: (session.user as any).impersonatedFounderId || userId,
  });

  await project.save();
  revalidatePath('/dashboard/projects');
  revalidatePath('/projects');
  
  return JSON.parse(JSON.stringify(project));
}

export async function updateProject(id: string, data: any) {
  await dbConnect();
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const project = await Project.findByIdAndUpdate(id, data, { new: true }).lean();
  
  revalidatePath('/dashboard/projects');
  revalidatePath('/projects');
  
  return JSON.parse(JSON.stringify(project));
}