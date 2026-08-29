"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#e11d48", "#8b5cf6", "#06b6d4"];

export default function AnalyticsCharts() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    totalRevenue: 0, activeLeadsCount: 0, conversionRate: 0, openInvoicesAmount: 0
  });
  
  const [charts, setCharts] = useState<any>({
    statusChartData: [], revenueOverTime: [], funnelData: []
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last 1 month
    endDate: new Date().toISOString().split('T')[0]
  });

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const url = `/api/analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {});
        setCharts(data.charts || {});
      }
    } catch (e) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const kpiData = [
    { name: "Total Revenue", value: `$${metrics.totalRevenue?.toLocaleString() || '0'}` },
    { name: "Active Leads", value: metrics.activeLeadsCount || 0 },
    { name: "Conversion Rate", value: `${metrics.conversionRate?.toFixed(1) || '0'}%` },
    { name: "Open Invoices", value: `$${metrics.openInvoicesAmount?.toLocaleString() || '0'}` },
  ];

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">From:</label>
          <input 
            type="datetime-local" 
            value={dateRange.startDate} 
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">To:</label>
          <input 
            type="datetime-local" 
            value={dateRange.endDate} 
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button onClick={fetchAnalytics} className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg ml-auto hover:bg-primary/90 transition-colors">
          Apply Filter
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          : kpiData.map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                <span className="text-muted-foreground text-sm font-medium">{item.name}</span>
                <span className="text-2xl font-bold text-foreground mt-2">{item.value}</span>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Over Time (Area Chart) */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground mb-6">Revenue Over Time</h3>
          <div className="h-80">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : charts.revenueOverTime?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">No revenue data in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead Status Distribution (Donut Chart) */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Lead Status Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            {loading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : charts.statusChartData?.length === 0 ? (
              <div className="text-muted-foreground">No leads found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {charts.statusChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales Funnel (Bar Chart) */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Sales Funnel</h3>
          <div className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : charts.funnelData?.length === 0 ? (
              <div className="text-muted-foreground flex justify-center items-center h-full">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
