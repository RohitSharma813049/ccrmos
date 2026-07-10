import { requirePermission } from "@/lib/auth-utils";
import { PERMISSIONS } from "@/config/permissions";

export default async function OwnerDashboardPage() {
  // Extra verification inside the page itself, though the layout handles it too!
  const user = await requirePermission(PERMISSIONS.PLATFORM_MONITORING);

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Platform Overview
        </h1>
        <p className="text-gray-600">
          Monitor your global SaaS metrics and configure system-wide structural changes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Companies" value="142" trend="+12%" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        <StatCard title="Monthly Recurring Rev" value="$42,500" trend="+5.2%" trendColor="text-emerald-400" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard title="Active Modules" value="24" trend="Stable" trendColor="text-blue-400" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction title="Deploy New Dynamic Field" desc="Add a custom field to all tenant databases globally." icon="M12 6v6m0 0v6m0-6h6m-6 0H6" color="blue" />
            <QuickAction title="Configure Industry Template" desc="Create a pre-configured CRM layout for new signups." icon="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" color="purple" />
            <QuickAction title="Tune AI Modules" desc="Adjust prompt parameters for the global AI engine." icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" color="emerald" />
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">System Health</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
            [Chart Area Placeholder]
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>API Latency: <span className="text-emerald-400 font-medium">42ms</span></span>
            <span>Database Load: <span className="text-blue-400 font-medium">14%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, trendColor = "text-emerald-400" }: { title: string, value: string, trend: string, icon: string, trendColor?: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-lg hover:border-gray-300 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100/50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <span className={`text-sm font-semibold ${trendColor} bg-gray-50/50 px-2.5 py-1 rounded-full border border-gray-200`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

function QuickAction({ title, desc, icon, color }: { title: string, desc: string, icon: string, color: "blue" | "purple" | "emerald" }) {
  const colorMap = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
  };

  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100/50 cursor-pointer transition-all border border-transparent hover:border-gray-300/50">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center shrink-0`}>
        <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <h4 className="text-gray-200 font-medium group-hover:text-gray-900 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
