"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsCharts() {
  const [data, setData] = useState({
    leads: 0, customers: 0, projects: 0, tasks: 0, orders: 0, invoices: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, customersRes, projectsRes, tasksRes, ordersRes, invoicesRes] = await Promise.all([
          fetch("/api/leads").then(res => res.json()),
          fetch("/api/customers").then(res => res.json()),
          fetch("/api/projects").then(res => res.json()),
          fetch("/api/tasks").then(res => res.json()),
          fetch("/api/orders").then(res => res.json()),
          fetch("/api/invoices").then(res => res.json())
        ]);
        
        setData({
          leads: leadsRes.leads?.length || 0,
          customers: customersRes.customers?.length || 0,
          projects: projectsRes.projects?.length || 0,
          tasks: tasksRes.tasks?.length || 0,
          orders: ordersRes.orders?.length || 0,
          invoices: invoicesRes.invoices?.length || 0,
        });
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
          <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">{item.name}</span>
            <span className="text-3xl font-bold text-gray-900 mt-2">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Entity Distribution</h3>
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

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Pipeline vs Operational</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
