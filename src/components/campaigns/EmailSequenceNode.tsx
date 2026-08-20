'use client';

import React from 'react';
import { Mail, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export interface SequenceStep {
  id: string;
  type: 'email' | 'delay';
  title: string;
  description?: string;
  delayDays?: number;
}

interface EmailSequenceNodeProps {
  step: SequenceStep;
  isLast: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EmailSequenceNode({ step, isLast, onEdit, onDelete }: EmailSequenceNodeProps) {
  return (
    <div className="relative flex gap-6 group">
      
      {/* Timeline Line & Icon */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm z-10 ${
          step.type === 'email' 
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/20' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 group-hover:border-zinc-600'
        } transition-all duration-300`}>
          {step.type === 'email' ? <Mail className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-zinc-800/80 -my-1 group-hover:bg-zinc-700 transition-colors" />
        )}
      </div>

      {/* Content Card */}
      <div className="flex-1 pb-8">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl p-5 shadow-sm transition-all duration-300 group-hover:border-zinc-700/80 group-hover:bg-zinc-800/40 group-hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {step.type === 'email' ? 'Automated Email' : 'Time Delay'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{step.description}</p>
              )}
            </div>
            
            {/* Actions Menu */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(step.id)}
                className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(step.id)}
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {step.type === 'email' && (
            <div className="mt-4 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Analytics</span>
                <div className="flex gap-4 font-medium">
                  <span className="text-emerald-400">42% Opened</span>
                  <span className="text-indigo-400">12% Clicked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
