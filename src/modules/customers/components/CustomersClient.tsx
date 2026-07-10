"use client";

import { useState, useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import DynamicFormBuilder from "@/components/ui/DynamicFormBuilder";
import { usePermissions } from "@/hooks/usePermissions";

export default function CustomersClient() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchPipeline();
    fetchCustomers();
  }, [page, search]);

  async function fetchPipeline() {
    try {
      const res = await fetch("/api/pipelines?module=customer");
      if (res.ok) {
        const data = await res.json();
        setPipelineStages(data.pipeline?.stages || []);
      }
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch(`/api/customers?page=${page}&limit=10&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.totalPages) setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (formData: any) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save customer");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateCustomerStatus = async (customerId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: customerId, status: newStatus })
      });
      if (res.ok) {
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update customer status");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isStageDisabled = (currentStatus: string, targetStage: any) => {
    const currentIndex = pipelineStages.findIndex(s => s.name === currentStatus);
    if (currentIndex === -1) return false;
    return targetStage.order < pipelineStages[currentIndex].order;
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer base and dynamic fields.</p>
        </div>
        {hasPermission("Customers", "Create") && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
        )}
      </div>

      
      <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 min-w-[200px]">Status (Pipeline)</th>
                <th className="px-6 py-4">Custom Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState 
                      title="No customers found" 
                      description="You haven't added any customers yet. Create your first customer to get started."
                      action={<Button size="sm" onClick={() => setIsModalOpen(true)}>Add Customer</Button>}
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.companyName}</td>
                    <td className="px-6 py-4">{customer.contactName}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.email || '-'}</td>
                    <td className="px-6 py-4">
                      {pipelineStages.length > 0 ? (
                        <select
                          value={customer.status}
                          onChange={(e) => updateCustomerStatus(customer._id, e.target.value)}
                          className="w-full text-sm border-gray-300 rounded-lg shadow-sm py-1.5 pl-3 pr-8 focus:ring-emerald-500 focus:border-emerald-500 border bg-white text-gray-700 font-medium cursor-pointer"
                        >
                          {!pipelineStages.find(s => s.name === customer.status) && (
                            <option value={customer.status} disabled>{customer.status}</option>
                          )}
                          
                          {pipelineStages.sort((a,b) => a.order - b.order).map(stage => (
                            <option 
                              key={stage.name} 
                              value={stage.name}
                              disabled={isStageDisabled(customer.status, stage)}
                            >
                              {stage.name} {isStageDisabled(customer.status, stage) ? '(Locked)' : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {customer.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {customer.customData && Object.keys(customer.customData).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(customer.customData).map(([k, v]) => (
                            <span key={k} className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700">
                              <strong className="text-gray-900">{k}:</strong> {String(v)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <DynamicFormBuilder 
                targetModule="customer" 
                onSubmit={handleSave} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}