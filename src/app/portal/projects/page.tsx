import { getPortalSession } from "@/lib/portal-auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Project from "@/modules/projects/schemas/Project";

export default async function PortalProjects() {
  const session = await getPortalSession();
  
  if (!session) {
    redirect("/portal/login");
  }

  await dbConnect();

  const projects = await Project.find({ "customData.customerId": session.customerId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Projects</h1>
        <p className="text-zinc-500 mt-1 text-sm">Track the status and progress of your active projects.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {projects.map((proj: any) => (
                  <tr key={proj._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{proj.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        proj.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {proj.status || 'Planning'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-zinc-600">{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900">No projects</h3>
            <p className="text-zinc-500 mt-1">There are no active projects associated with your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
