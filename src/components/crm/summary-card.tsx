import React from 'react'
import { LucideIcon } from 'lucide-react'

export interface BadgeProps {
  label: string
  value: string | number
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink'
}

interface SummaryCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconBgColor: string
  iconTextColor?: string
  subtitle?: string
  badges?: BadgeProps[]
}

const badgeColorMap = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconTextColor = 'text-white',
  subtitle,
  badges
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-500 font-medium text-sm mb-1">{title}</h3>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
        {subtitle && (
          <span className="text-xs text-slate-400 font-medium">• {subtitle}</span>
        )}
        {badges && badges.map((badge, idx) => (
          <span 
            key={idx}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColorMap[badge.color]}`}
          >
            {badge.label}: {badge.value}
          </span>
        ))}
      </div>
    </div>
  )
}
