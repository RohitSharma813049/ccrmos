'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
  { name: 'Jul', revenue: 7000 },
];

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              border: '1px solid #27272a',
              borderRadius: '0.75rem',
              color: '#f4f4f5'
            }}
            itemStyle={{ color: '#818cf8' }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#818cf8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
