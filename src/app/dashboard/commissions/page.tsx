'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = async () => {
    try {
      const res = await fetch('/api/commissions');
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Commission marked as ${status}`);
        fetchCommissions();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title="Agent Commissions" 
        description="Track and manage agent payouts for closed deals." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading commissions...</p>
        ) : commissions.length === 0 ? (
          <div className="col-span-3 text-center p-12 bg-card border border-border rounded-xl">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">No Commissions Found</p>
            <p className="text-muted-foreground">When a deal is closed, commissions will appear here.</p>
          </div>
        ) : (
          commissions.map((comm) => (
            <div key={comm._id} className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {comm.agentId?.firstName} {comm.agentId?.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground">{comm.agentId?.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    comm.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 
                    comm.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {comm.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 bg-muted/20 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deal Value</span>
                    <span className="font-medium text-foreground">{comm.currency} {comm.dealValue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Commission</span>
                    <span className="font-medium text-foreground">{comm.currency} {comm.grossCommissionAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Agent Split</span>
                    <span className="font-medium text-foreground">{comm.agentSplitPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border mt-2">
                    <span className="font-semibold text-foreground">Agent Take Home</span>
                    <span className="font-bold text-primary">{comm.currency} {comm.agentTakeHomeAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Lead: {comm.leadId?.firstName} {comm.leadId?.lastName}</p>
                  <p>Property: {comm.propertyId?.name}</p>
                  <p>Date: {new Date(comm.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                {comm.status === 'Pending' && (
                  <>
                    <button onClick={() => updateStatus(comm._id, 'Paid')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm text-center transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Paid
                    </button>
                    <button onClick={() => updateStatus(comm._id, 'Void')} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-sm text-center transition-colors">
                      <XCircle className="w-4 h-4" />
                      Void
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
