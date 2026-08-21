"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/companies/${id}/stats`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-zinc-400">Loading company data...</p>
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 font-semibold">Company not found.</p>
      </div>
    );
  }

  const { company, founder, stats } = data;

  const handleImpersonate = async () => {
    if (!founder) {
      alert("No founder found for this company to impersonate.");
      return;
    }
    try {
      const res = await fetch("/api/owner/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founderId: founder._id || founder.id })
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Failed to impersonate");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href="/owner/companies" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-500 transition-colors mb-2 font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Companies
          </Link>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{company.name}</h1>
          <p className="text-zinc-400 mt-1">Detailed tenant dashboard and analytics.</p>
        </div>
        <button 
          onClick={handleImpersonate}
          className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Dashboard as Tenant
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-100 mb-4">Tenant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-zinc-400">Plan</p>
            <p className="font-semibold text-zinc-100">{company.plan}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Status</p>
            <p className="font-semibold text-zinc-100">{company.status}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Registered On</p>
            <p className="font-semibold text-zinc-100">{new Date(company.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Primary Admin Email</p>
            <p className="font-semibold text-zinc-100">{company.adminEmail}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Users Quota</p>
            <p className="font-semibold text-zinc-100">{stats.users} / {company.usersQuota}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <h2 className="text-xl font-bold text-zinc-100">Platform Usage Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Leads" value={stats.leads} color="text-blue-600" />
        <StatBox label="Customers" value={stats.customers} color="text-green-600" />
        <StatBox label="Projects" value={stats.projects} color="text-purple-600" />
        <StatBox label="Orders" value={stats.orders} color="text-orange-600" />
        <StatBox label="Tasks" value={stats.tasks} color="text-pink-600" />
        <StatBox label="Total Invoiced Revenue" value={`$${stats.revenue.toLocaleString()}`} color="text-emerald-600" />
      </div>

    </div>
  );
}

function StatBox({ label, value, color = "text-zinc-100" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-700/50 rounded-xl p-4 shadow-sm">
      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
