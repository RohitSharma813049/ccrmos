'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingRevenueChartProps {
  data: { name: string; revenue: number; count: number }[];
}

export default function BookingRevenueChart({ data }: BookingRevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm backdrop-blur-xl">
        No booking data available
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm p-5 flex flex-col h-full backdrop-blur-xl">
      <h3 className="text-base font-semibold text-zinc-100 mb-4">Revenue (Last 6 Months)</h3>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#a1a1aa" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#a1a1aa" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderColor: 'rgba(63, 63, 70, 0.5)', borderRadius: '12px' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, 'Revenue']}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
