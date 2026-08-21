"use client";

import React, { useState, useEffect } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";

interface ILoyaltyProfile {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
  };
  pointsBalance: number;
  lifetimePoints: number;
  tier: string;
  history: any[];
}

export default function RewardsClient() {
  const [profiles, setProfiles] = useState<ILoyaltyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ILoyaltyProfile | null>(null);

  // Form state
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<"EARNED" | "REDEEMED" | "ADJUSTED">("EARNED");
  const [reason, setReason] = useState("");

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openAdjustModal = (profile: ILoyaltyProfile) => {
    setSelectedProfile(profile);
    setAmount(0);
    setType("EARNED");
    setReason("");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    try {
      const res = await fetch("/api/rewards/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedProfile.customerId._id,
          amount,
          type,
          reason
        })
      });

      if (res.ok) {
        setIsAdjustModalOpen(false);
        fetchProfiles();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to adjust points");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-zinc-700/50 text-zinc-100 border-zinc-700/50';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Silver': return 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50';
      default: return 'bg-orange-50 text-orange-800 border-orange-200';
    }
  };

  const columns: ColumnDef<ILoyaltyProfile>[] = [
    {
      header: "Customer",
      cell: (item) => (
        <div>
          <div className="font-semibold text-foreground">
            {item.customerId?.firstName} {item.customerId?.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{item.customerId?.email}</div>
          {item.customerId?.companyName && <div className="text-xs text-muted-foreground">{item.customerId.companyName}</div>}
        </div>
      )
    },
    {
      header: "Tier",
      cell: (item) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${getTierColor(item.tier)}`}>
          {item.tier}
        </span>
      )
    },
    {
      header: "Points Balance",
      cell: (item) => (
        <span className="font-bold text-emerald-600 text-lg">{item.pointsBalance.toLocaleString()}</span>
      )
    },
    {
      header: "Lifetime Points",
      cell: (item) => (
        <span className="text-muted-foreground font-medium">{item.lifetimePoints.toLocaleString()}</span>
      )
    },
    {
      header: "Actions",
      cell: (item) => (
        <Button size="sm" variant="secondary" onClick={() => openAdjustModal(item)}>
          Adjust Points
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Royalty & Rewards</h1>
          <p className="text-sm text-muted-foreground">Manage customer loyalty points, tiers, and rewards.</p>
        </div>
      </div>

      <DataTable
        data={profiles}
        columns={columns}
        loading={loading}
        emptyTitle="No Loyalty Profiles"
        emptyDescription="Customers earn profiles automatically, or you can manage them from the Customer profile."
      />

      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Adjust Points for {selectedProfile?.customerId?.firstName}</h2>
            
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="EARNED">Add Points (Earned)</option>
                  <option value="REDEEMED">Deduct Points (Redeemed)</option>
                  <option value="ADJUSTED">Manual Adjustment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason / Note</label>
                <input
                  type="text"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g., Summer Promo, Refund..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
                <Button type="submit">Confirm Adjustment</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
