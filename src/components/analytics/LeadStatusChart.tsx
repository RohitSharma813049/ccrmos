'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LeadStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function LeadStatusChart({ data }: LeadStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm backdrop-blur-xl">
        No lead data available
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm p-5 flex flex-col h-full backdrop-blur-xl">
      <h3 className="text-base font-semibold text-zinc-100 mb-4">Leads by Status</h3>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderColor: 'rgba(63, 63, 70, 0.5)', borderRadius: '12px', color: '#f4f4f5' }}
              itemStyle={{ color: '#f4f4f5' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
