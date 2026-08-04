'use client'

import React from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'

export default function ManualWhatsAppPage() {
  return (
    <div className="absolute inset-0 bg-[#25D366] flex items-center justify-center -m-4 sm:-m-6 lg:-m-8 z-50">
      
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden">
        
        {/* Floating icon for style matching the screenshot */}
        <div className="absolute top-8 left-8">
          <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 text-white fill-white" />
          </div>
        </div>

        <div className="pt-8 space-y-12">
          <h1 className="text-3xl font-light text-slate-800">WhatsApp Integration</h1>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-8 h-8 text-[#25D366] animate-spin" />
            
            <div className="space-y-2">
              <p className="text-slate-700 font-medium text-lg">Restoring WhatsApp sessions...</p>
              <p className="text-slate-400 text-sm">This may take a few seconds</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
