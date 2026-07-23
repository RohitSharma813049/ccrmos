"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', latency: 45, load: 12 },
  { time: '04:00', latency: 42, load: 15 },
  { time: '08:00', latency: 48, load: 22 },
  { time: '12:00', latency: 65, load: 35 },
  { time: '16:00', latency: 55, load: 28 },
  { time: '20:00', latency: 40, load: 14 },
  { time: '24:00', latency: 42, load: 14 },
];

export default function SystemHealthChart() {
  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderRadius: '8px', 
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            }} 
            itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}
          />
          <Area 
            type="monotone" 
            dataKey="latency" 
            stroke="#34d399" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorLatency)" 
            name="API Latency (ms)"
          />
          <Area 
            type="monotone" 
            dataKey="load" 
            stroke="#60a5fa" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorLoad)" 
            name="Database Load (%)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
