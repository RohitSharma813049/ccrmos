'use client'

import React, { useEffect, useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function ManualWhatsAppPage() {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/qr')
        if (!res.ok) throw new Error('Failed to fetch status')
        const data = await res.json()
        
        if (data.isReady) {
          setIsReady(true)
          toast.success('WhatsApp Connected Successfully!')
          router.push('/dashboard/whatsapp')
        } else if (data.qrUrl) {
          setQrUrl(data.qrUrl)
        }
      } catch (err) {
        console.error(err)
        setIsError(true)
      }
    }

    // Fetch immediately
    fetchStatus()

    // Then poll every 3 seconds
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="absolute inset-0 bg-[#25D366] flex items-center justify-center -m-4 sm:-m-6 lg:-m-8 z-50">
      
      <div className="bg-zinc-900/40 backdrop-blur-xl w-[500px] rounded-2xl shadow-2xl p-12 text-center relative overflow-hidden">
        
        {/* Floating icon */}
        <div className="absolute top-8 left-8">
          <button onClick={() => router.back()} className="w-10 h-10 hover:bg-zinc-800/50 rounded-full flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
        </div>
        
        <div className="absolute top-8 right-8">
          <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-7 h-7 text-white fill-white" />
          </div>
        </div>

        <div className="pt-12 space-y-12">
          <h1 className="text-3xl font-light text-zinc-100">WhatsApp Integration</h1>
          
          <div className="flex flex-col items-center justify-center space-y-6 min-h-[250px]">
            
            {isError ? (
              <div className="space-y-2">
                <p className="text-rose-400 font-medium text-lg">Connection Error</p>
                <p className="text-zinc-400 text-sm">Failed to connect to the WhatsApp service.</p>
              </div>
            ) : !qrUrl && !isReady ? (
              <>
                <Loader2 className="w-12 h-12 text-[#25D366] animate-spin" />
                <div className="space-y-2">
                  <p className="text-zinc-100 font-medium text-lg">Initializing WhatsApp Service...</p>
                  <p className="text-zinc-400 text-sm">Please wait a moment for the QR code</p>
                </div>
              </>
            ) : qrUrl && !isReady ? (
              <div className="space-y-6 w-full animate-in fade-in zoom-in duration-500">
                <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                  <img src={qrUrl} alt="WhatsApp QR Code" className="w-48 h-48 rounded-md bg-white p-2" />
                  <p className="text-sm font-medium text-zinc-400">Scan QR Code from WhatsApp</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[#25D366] font-medium text-lg">Connected!</p>
                <p className="text-zinc-400 text-sm">Redirecting...</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
