import Link from "next/link";
import { cookies } from "next/headers";
import { getPortalSession } from "@/lib/portal-auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPortalSession();
  
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/portal" className="text-xl font-bold tracking-tight text-indigo-600">
              Client Portal
            </Link>
            
            {session && (
              <nav className="hidden md:flex gap-6">
                <Link href="/portal" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Dashboard</Link>
                <Link href="/portal/projects" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Projects</Link>
                <Link href="/portal/invoices" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Invoices</Link>
                <Link href="/portal/tickets" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Support</Link>
              </nav>
            )}
          </div>
          
          {session && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500 hidden sm:inline-block">{session.email}</span>
              <form action={async () => {
                "use server";
                const cookieStore = await cookies();
                cookieStore.delete("portal_token");
                redirect("/portal/login");
              }}>
                <button type="submit" className="text-zinc-400 hover:text-zinc-700 transition-colors p-2 rounded-full hover:bg-zinc-100 flex items-center justify-center">
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
