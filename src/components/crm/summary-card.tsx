import React from 'react'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

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
  href?: string
}

const badgeColorMap = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  red: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconTextColor = 'text-white',
  subtitle,
  badges,
  href
}: SummaryCardProps) {
  // Adjust legacy bright tailwind colors to dark mode friendly versions
  const bgAdjusted = iconBgColor
    .replace('bg-blue-500', 'bg-blue-500/20 text-blue-400')
    .replace('bg-green-500', 'bg-emerald-500/20 text-emerald-400')
    .replace('bg-emerald-500', 'bg-emerald-500/20 text-emerald-400')
    .replace('bg-purple-500', 'bg-indigo-500/20 text-indigo-400')
    .replace('bg-orange-500', 'bg-amber-500/20 text-amber-400')
    .replace('bg-rose-500', 'bg-rose-500/20 text-rose-400');

  const content = (
    <div className="bg-zinc-900/40 rounded-2xl p-5 border border-zinc-800/60 shadow-sm flex flex-col h-full justify-between backdrop-blur-xl transition-all duration-300 hover:bg-zinc-900/60 hover:border-zinc-700/60">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-zinc-400 font-medium text-sm mb-1">{title}</h3>
          <div className="text-3xl font-bold text-zinc-100 tracking-tight">{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgAdjusted} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-auto pt-2 flex items-center gap-2 flex-wrap">
        {subtitle && (
          <span className="text-xs text-zinc-500 font-medium">• {subtitle}</span>
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
  );

  return href ? (
    <Link href={href} className="block h-full cursor-pointer">
      {content}
    </Link>
  ) : (
    <div className="h-full">
      {content}
    </div>
  )
}
