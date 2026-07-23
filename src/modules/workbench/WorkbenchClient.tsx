"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WorkbenchClient() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, ordersRes] = await Promise.all([
          fetch("/api/tasks?limit=5"),
          fetch("/api/orders?limit=5")
        ]);
        if (tasksRes.ok) {
          const t = await tasksRes.json();
          setTasks(t.data || []);
        }
        if (ordersRes.ok) {
          const o = await ordersRes.json();
          setOrders(o.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Workbench</h1>
        <p className="text-muted-foreground mt-1">Your daily tasks and recent orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">My Tasks</h2>
            <Link href="/dashboard/tasks" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending tasks.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map(t => (
                <li key={t._id} className="border-b border-border pb-2 last:border-0">
                  <p className="font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent orders.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map(o => (
                <li key={o._id} className="border-b border-border pb-2 last:border-0">
                  <p className="font-medium text-foreground">{o.title || "Order #" + o._id.substring(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{o.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
