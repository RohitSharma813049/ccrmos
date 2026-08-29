import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";
import SystemHealthChart from "@/components/ui/SystemHealthChart";

export default async function OwnerDashboardPage() {
  // Extra verification inside the page itself, though the layout handles it too!
  const user = await requirePermission(PERMISSIONS.PLATFORM_MONITORING);

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Platform Overview
        </h1>
        <p className="text-muted-foreground">
          Monitor your global SaaS metrics and configure system-wide structural changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Companies" value="142" trend="+12%" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        <StatCard title="Monthly Recurring Rev" value="$42,500" trend="+5.2%" trendColor="text-emerald-500" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard title="Active Modules" value="24" trend="Stable" trendColor="text-blue-500" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction title="Deploy New Dynamic Field" desc="Add a custom field to all tenant databases globally." icon="M12 6v6m0 0v6m0-6h6m-6 0H6" color="blue" />
            <QuickAction title="Configure Industry Template" desc="Create a pre-configured CRM layout for new signups." icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" color="purple" />
            <QuickAction title="Tune AI Modules" desc="Adjust prompt parameters for the global AI engine." icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color="emerald" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-foreground">System Health</h2>
          <div className="h-64 border border-border bg-background/50 rounded-xl p-4">
            <SystemHealthChart />
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>API Latency: <span className="text-emerald-500 font-medium">42ms</span></span>
            <span>Database Load: <span className="text-blue-500 font-medium">14%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, trendColor = "text-emerald-500" }: { title: string, value: string, trend: string, icon: string, trendColor?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:border-primary/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <svg className="w-6 h-6 text-primary" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <span className={`text-sm font-semibold ${trendColor} bg-background px-2.5 py-1 rounded-full border border-border`}>
          {trend}
        </span>
      </div>
      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function QuickAction({ title, desc, icon, color }: { title: string, desc: string, icon: string, color: "blue" | "purple" | "emerald" }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
  };

  return (
    <button className="w-full text-left group flex items-center gap-4 p-3 rounded-xl hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all border border-transparent hover:border-border">
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center shrink-0`}>
        <svg className="w-5 h-5 currentColor" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <h4 className="text-foreground font-medium group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-muted-foreground" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
