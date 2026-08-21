import React from 'react'
import { CheckCircle2, Clock, XCircle, ImageIcon, Edit3, Check, AlertTriangle, Video } from 'lucide-react'

export interface ActivityItemProps {
  id: string
  name: string
  comment?: string
  date: string
  time: string
  status: 'done' | 'pending' | 'overdue'
  imagesCount?: number
  images?: string[]
  notAssigned?: boolean
  location?: string
  timestamp?: string
}

interface ActivityListProps {
  title: string
  count?: number
  totalCount?: number
  items: ActivityItemProps[]
  emptyMessage?: string
  showMeetButton?: boolean
  onEdit?: (id: string) => void
  onComplete?: (id: string) => void
}

export function ActivityList({ title, count, totalCount, items, emptyMessage = 'No data found', showMeetButton = false, onEdit, onComplete }: ActivityListProps) {
  return (
    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/60 shadow-sm overflow-hidden flex flex-col h-full backdrop-blur-xl">
      <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-950/50 sticky top-0 z-10">
        <h3 className="font-semibold text-zinc-100">{title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium">
          {count !== undefined && (
            <span className={totalCount ? "text-zinc-400 font-bold" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-md"}>
              {count} {totalCount && `/ ${totalCount}`}
            </span>
          )}
          <button className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md transition-colors border border-zinc-700/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
        {items.length === 0 ? (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-zinc-500 gap-2">
            <CalendarIcon className="w-8 h-8 opacity-20" />
            <span className="text-sm">{emptyMessage}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-xl border ${
                  item.status === 'done' ? 'bg-emerald-500/5 border-emerald-500/20' : 
                  item.status === 'overdue' ? 'bg-rose-500/5 border-rose-500/20' : 
                  'bg-zinc-950/50 border-zinc-800/60'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : item.status === 'overdue' ? (
                      <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${item.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'done' && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {item.status === 'overdue' && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Overdue
                      </span>
                    )}
                    {(item.status === 'pending' || item.status === 'overdue') && (
                      <div className="flex items-center gap-1.5">
                        {showMeetButton && (
                          <a 
                            href={item.location && item.location.includes('http') ? item.location : "https://meet.google.com/new"}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                            title={item.location && item.location.includes('http') ? "Join Meeting" : "Start Google Meet"}
                          >
                            <Video className="w-3 h-3" />
                          </a>
                        )}
                        <button onClick={() => onEdit?.(item.id)} className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => onComplete?.(item.id)} className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {item.comment && (
                  <p className="text-xs text-zinc-400 mt-1 mb-2 pl-5.5 leading-relaxed">
                    {item.comment}
                  </p>
                )}
                
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 pl-5.5 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{item.date} <strong className="font-semibold text-zinc-400">{item.time}</strong></span>
                </div>
                
                {item.notAssigned && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 pl-5.5 mt-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Not assigned</span>
                  </div>
                )}

                {item.imagesCount && item.imagesCount > 0 && (
                  <div className="pl-5.5 mt-3">
                    <div className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mb-1.5">
                      <ImageIcon className="w-3 h-3" /> {item.imagesCount} image(s)
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {item.images?.map((img, idx) => (
                        <div key={idx} className="w-24 h-16 bg-zinc-800 rounded-md overflow-hidden shrink-0 border border-zinc-700">
                          <img src={img} alt="Visit photo" className="w-full h-full object-cover opacity-80" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
