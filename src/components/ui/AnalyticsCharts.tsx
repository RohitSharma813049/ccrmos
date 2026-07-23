"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#e11d48", "#10b981", "#3b82f6"];

export default function AnalyticsCharts() {
  const [data, setData] = useState({
    leads: 0, customers: 0, projects: 0, tasks: 0, orders: 0, invoices: 0
  });
  
  const [leadsByStatus, setLeadsByStatus] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

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

        const [leadsRes, customersRes, projectsRes, tasksRes, ordersRes, invoicesRes] = await Promise.all([
          fetchJson("/api/leads"),
          fetchJson("/api/customers"),
          fetchJson("/api/projects"),
          fetchJson("/api/tasks"),
          fetchJson("/api/orders"),
          fetchJson("/api/invoices")
        ]);
        
        const leads = leadsRes.leads || [];
        const customers = customersRes.customers || [];
        const projects = projectsRes.projects || [];
        const tasks = tasksRes.tasks || [];
        const orders = ordersRes.orders || [];
        const invoices = invoicesRes.invoices || [];

        setData({
          leads: leads.length,
          customers: customers.length,
          projects: projects.length,
          tasks: tasks.length,
          orders: orders.length,
          invoices: invoices.length,
        });

        // Leads by Status
        const lStatusCount = leads.reduce((acc: any, curr: any) => {
          const s = curr.status || "new";
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});
        setLeadsByStatus(Object.keys(lStatusCount).map(k => ({ name: k.toUpperCase(), value: lStatusCount[k] })));

        // Tasks by Status
        const tStatusCount = tasks.reduce((acc: any, curr: any) => {
          const s = curr.status || "Pending";
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {});
        setTasksByStatus(Object.keys(tStatusCount).map(k => ({ name: k, count: tStatusCount[k] })));

        // Growth Data (Leads over time)
        const dateCounts = leads.reduce((acc: any, curr: any) => {
          if (!curr.createdAt) return acc;
          const d = new Date(curr.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {});
        
        // Convert to array and sort by actual date (assuming mostly recent)
        // For simplicity in a dynamic map, we just take the last 7 unique days sorted alphabetically by key or natively as added
        const growth = Object.keys(dateCounts).map(dateStr => ({ date: dateStr, leads: dateCounts[dateStr] }));
        setGrowthData(growth.length ? growth : [{ date: "No Data", leads: 0 }]);

      } catch (e) {
        console.error("Failed to fetch dashboard metrics");
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
        {barData.map((item, index) => (
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Area Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Lead Growth Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Status */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Leads by Status</h3>
          <div className="h-72 flex items-center justify-center">
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
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Tasks by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
