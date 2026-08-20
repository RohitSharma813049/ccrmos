'use client';

import React from 'react';
import { TrendingUp, Users, Building, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LeadConversionChart } from '@/components/dashboard/LeadConversionChart';

const stats = [
  { name: 'Total Revenue', value: '$2,450,000', change: '+12.5%', changeType: 'positive', icon: DollarSign },
  { name: 'Active Leads', value: '3,240', change: '+18.2%', changeType: 'positive', icon: Users },
  { name: 'Properties Sold', value: '142', change: '-4.1%', changeType: 'negative', icon: Building },
  { name: 'Conversion Rate', value: '24.8%', change: '+2.4%', changeType: 'positive', icon: TrendingUp },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Welcome back. Here is what's happening with your brokerage today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="relative overflow-hidden rounded-2xl bg-zinc-900/50 p-6 border border-zinc-800/60 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-zinc-800/50 hover:border-zinc-700/60 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">{stat.value}</p>
              </div>
              <div className="p-3 bg-zinc-800/80 rounded-xl ring-1 ring-white/5 group-hover:bg-indigo-500/10 group-hover:ring-indigo-500/20 transition-all duration-300">
                <stat.icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${stat.changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </span>
              <span className="ml-2 text-zinc-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-zinc-100">Revenue Over Time</h3>
            <p className="text-sm text-zinc-500">Monthly commission revenue for the last 6 months</p>
          </div>
          <RevenueChart />
        </div>

        {/* Lead Conversion Chart */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-zinc-100">Lead Pipeline</h3>
            <p className="text-sm text-zinc-500">Current status breakdown</p>
          </div>
          <LeadConversionChart />
        </div>
      </div>

    </div>
  );
}
