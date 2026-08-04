import React from 'react'
import { CheckCircle2, Clock, XCircle, ImageIcon, Edit3, Check, AlertTriangle } from 'lucide-react'

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
}

interface ActivityListProps {
  title: string
  count?: number
  totalCount?: number
  items: ActivityItemProps[]
  emptyMessage?: string
}

export function ActivityList({ title, count, totalCount, items, emptyMessage = 'No data found' }: ActivityListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <div className="flex items-center gap-2 text-xs font-medium">
          {count !== undefined && (
            <span className={totalCount ? "text-slate-600 font-bold" : "bg-blue-50 text-blue-600 px-2 py-1 rounded-md"}>
              {count} {totalCount && `/ ${totalCount}`}
            </span>
          )}
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
        {items.length === 0 ? (
          <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-slate-400 gap-2">
            <CalendarIcon className="w-8 h-8 opacity-20" />
            <span className="text-sm">{emptyMessage}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border ${
                  item.status === 'done' ? 'bg-[#f4fcf6] border-[#d8f3e1]' : 
                  item.status === 'overdue' ? 'bg-[#fdf3f4] border-[#fce4e6]' : 
                  'bg-[#fdf3f4] border-[#fce4e6]' /* using red bg for pending as shown in screenshot */
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : item.status === 'overdue' ? (
                      <Clock className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <CalendarIcon className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${item.status === 'overdue' ? 'text-slate-800' : 'text-slate-700'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'done' && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {item.status === 'overdue' && (
                      <span className="text-red-600 font-bold text-[11px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Overdue
                      </span>
                    )}
                    {(item.status === 'pending' || item.status === 'overdue') && (
                      <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 transition-colors">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button className="p-1 rounded bg-green-50 border border-green-200 text-green-500 hover:bg-green-100 transition-colors">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {item.comment && (
                  <p className="text-xs text-slate-500 mt-1 mb-2 pl-5.5 leading-relaxed">
                    {item.comment}
                  </p>
                )}
                
                <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-5.5 mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{item.date} <strong className="font-semibold">{item.time}</strong></span>
                </div>
                
                {item.notAssigned && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 pl-5.5 mt-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Not assigned</span>
                  </div>
                )}

                {item.imagesCount && item.imagesCount > 0 && (
                  <div className="pl-5.5 mt-3">
                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1.5">
                      <ImageIcon className="w-3 h-3" /> {item.imagesCount} image(s)
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {item.images?.map((img, idx) => (
                        <div key={idx} className="w-24 h-16 bg-slate-200 rounded-md overflow-hidden shrink-0">
                          <img src={img} alt="Visit photo" className="w-full h-full object-cover" />
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
