import dbConnect from "@/lib/db";
import Form from "@/modules/forms/schemas/Form";
import FormSubmission from "@/modules/forms/schemas/FormSubmission";
import { getSession } from "@/lib/auth-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Form Submissions | Dashboard",
};

export default async function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getSession();
  const user = session?.user as any;
  
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  
  const form = await Form.findOne({ _id: id, companyId: user.companyId });
  
  if (!form) {
    return <div className="p-8 text-center text-red-500">Form not found or access denied.</div>;
  }

  const submissions = await FormSubmission.find({ formId: id, companyId: user.companyId }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6 fade-in pb-20 max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-zinc-800/60">
        <Link href={`/dashboard/forms/${id}`} className="p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-950/50 hover:bg-zinc-800/50 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Submissions: {form.title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{submissions.length} responses</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl p-12 shadow-sm border border-zinc-700/50 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-950/50 rounded-full flex items-center justify-center text-zinc-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2">No Submissions Yet</h3>
          <p className="text-zinc-400 max-w-sm">Share your form to start collecting responses.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/40 backdrop-blur-xl shadow-sm border border-zinc-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/50 border-b border-zinc-700/50 text-zinc-300">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Submitted At</th>
                  {form.fields.map((field: any) => (
                    <th key={field.id} className="px-6 py-4 font-semibold whitespace-nowrap">{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-zinc-950/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    {form.fields.map((field: any) => (
                      <td key={field.id} className="px-6 py-4 max-w-xs truncate" title={sub.data?.[field.id] ? String(sub.data[field.id]) : ""}>
                        {sub.data?.[field.id] !== undefined ? String(sub.data[field.id]) : <span className="text-gray-300">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
