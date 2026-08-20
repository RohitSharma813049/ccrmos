import React from 'react';
import { TrendingUp, Users, Building, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

      {/* Content Section Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-6 min-h-[400px] flex items-center justify-center">
          <p className="text-zinc-500 font-medium flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Chart (Recharts) goes here
          </p>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/60 p-6 min-h-[400px]">
          <h3 className="text-base font-semibold text-zinc-100 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 ring-1 ring-white/5" />
                <div>
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium text-zinc-100">Sarah Jenkins</span> closed a deal for 
                    <span className="text-indigo-400 font-medium"> 124 Ocean Ave</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
