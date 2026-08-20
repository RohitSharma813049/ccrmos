"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#e11d48", "#10b981", "#3b82f6"];

export default function AnalyticsCharts() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    leads: 0, customers: 0, projects: 0, tasks: 0, orders: 0, invoices: 0
  });
  
  const [leadsByStatus, setLeadsByStatus] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);
  const [teamBreakdown, setTeamBreakdown] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchJson = async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return {};
            const text = await res.text();
            return text ? JSON.parse(text) : {};
          } catch (e) {
            return {};
          }
        };

        const res = await fetchJson("/api/dashboard");
        
        if (res.summary) {
          setData(res.summary);
        }
        
        if (res.teamBreakdown) {
          setTeamBreakdown(res.teamBreakdown.map((t: any) => ({ name: t.name, count: t.count })));
        }

        if (res.leadsByStatus) {
          setLeadsByStatus(res.leadsByStatus);
        }

        if (res.tasksByStatus) {
          setTasksByStatus(res.tasksByStatus);
        }

      } catch (e) {
        console.error("Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const barData = [
    { name: "Leads", count: data.leads },
    { name: "Customers", count: data.customers },
    { name: "Projects", count: data.projects },
    { name: "Tasks", count: data.tasks },
    { name: "Orders", count: data.orders },
    { name: "Invoices", count: data.invoices },
  ];

  const pieData = [
    { name: "Active Pipeline", value: data.leads + data.projects },
    { name: "Closed/Operational", value: data.customers + data.orders }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-10" />
              </div>
            ))
          : barData.map((item, index) => (
              <div key={index} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center">
                <span className="text-muted-foreground text-sm font-medium">{item.name}</span>
                <span className="text-3xl font-bold text-foreground mt-2">{item.count}</span>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Entity Distribution</h3>
          <div className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Team Performance Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Team Lead Breakdown</h3>
          <div className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Leads by Status</h3>
          <div className="h-72 flex items-center justify-center">
            {loading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Tasks by Status</h3>
          <div className="h-72">
            {loading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
