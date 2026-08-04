'use client'

import React, { useEffect, useState } from 'react'
import { MessageCircle, Loader2, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function ManualWhatsAppPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading process
    const timer1 = setTimeout(() => setStep(2), 2000)
    const timer2 = setTimeout(() => {
      setStep(3)
      toast.success('Ready to connect!')
    }, 4000)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="absolute inset-0 bg-[#25D366] flex items-center justify-center -m-4 sm:-m-6 lg:-m-8 z-50">
      
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden">
        
        {/* Floating icon */}
        <div className="absolute top-8 left-8">
          <button onClick={() => router.back()} className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
        </div>
        
        <div className="absolute top-8 right-8">
          <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 text-white fill-white" />
          </div>
        </div>

        <div className="pt-12 space-y-12">
          <h1 className="text-3xl font-light text-slate-800">WhatsApp Integration</h1>
          
          <div className="flex flex-col items-center justify-center space-y-6 min-h-[200px]">
            
            {step === 1 && (
              <>
                <Loader2 className="w-12 h-12 text-[#25D366] animate-spin" />
                <div className="space-y-2">
                  <p className="text-slate-700 font-medium text-lg">Initializing WhatsApp Service...</p>
                  <p className="text-slate-400 text-sm">Please wait a moment</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Loader2 className="w-12 h-12 text-[#25D366] animate-spin" />
                <div className="space-y-2">
                  <p className="text-slate-700 font-medium text-lg">Restoring WhatsApp Sessions...</p>
                  <p className="text-slate-400 text-sm">This may take a few seconds</p>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6 w-full animate-in fade-in zoom-in duration-500">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                  <QrCode className="w-32 h-32 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">Scan QR Code from WhatsApp</p>
                </div>
                
                <button 
                  onClick={() => {
                    toast.success('Connected successfully! (Demo)')
                    router.push('/dashboard/whatsapp')
                  }}
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  Simulate Connection
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
