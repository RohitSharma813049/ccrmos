import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Enforce superadmin role
  if (session.user.role !== "superadmin") {
    // If they have some other role or no role, don't let them in
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950/50 text-zinc-100">
      <nav className="border-b border-zinc-700/50 bg-zinc-900/40 backdrop-blur-xl px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-100">
          CRM OS Admin
        </h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-zinc-400">{session.user.email}</span>
        </div>
      </nav>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}
