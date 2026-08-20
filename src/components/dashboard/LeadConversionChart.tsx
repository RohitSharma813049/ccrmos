'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'New', value: 400 },
  { name: 'Contacted', value: 300 },
  { name: 'Qualified', value: 300 },
  { name: 'Closed', value: 200 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export function LeadConversionChart() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
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
            animationDuration={1500}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              border: '1px solid #27272a',
              borderRadius: '0.75rem',
              color: '#f4f4f5'
            }}
            itemStyle={{ color: '#f4f4f5' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-zinc-400 text-sm ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
