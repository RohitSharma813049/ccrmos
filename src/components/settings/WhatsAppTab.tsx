'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export function WhatsAppTab() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/whatsapp/qr');
      if (!res.ok) throw new Error('Failed to fetch WhatsApp status');
      
      const data = await res.json();
      setIsReady(data.isReady);
      setQrUrl(data.qrUrl);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds if not ready and no error
    const interval = setInterval(() => {
      if (!isReady && !error) {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isReady, error]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">WhatsApp Integration</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Link your WhatsApp account to send and receive messages directly from the CRM.
        </p>
      </div>

      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 shadow-sm max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isReady ? 'bg-emerald-500/10' : 'bg-emerald-500/10'}`}>
            <Smartphone className={`w-6 h-6 ${isReady ? 'text-emerald-400' : 'text-emerald-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Connection Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                {isReady ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </>
                )}
              </span>
              <span className={`text-sm font-medium ${isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isReady ? 'Connected and ready' : 'Waiting for connection...'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-rose-400">Connection Error</h4>
              <p className="text-xs text-rose-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isReady && !error && (
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            {isLoading && !qrUrl ? (
              <div className="flex flex-col items-center">
                <RefreshCcw className="w-8 h-8 text-zinc-500 animate-spin mb-4" />
                <p className="text-sm text-zinc-400">Generating QR Code...</p>
                <p className="text-xs text-zinc-500 mt-2">The headless browser is starting up. This may take a few seconds.</p>
              </div>
            ) : qrUrl ? (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                  <img src={qrUrl} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                </div>
                <h4 className="text-lg font-semibold text-zinc-100 mb-2">Scan to Link WhatsApp</h4>
                <ol className="text-sm text-zinc-400 text-left list-decimal list-inside space-y-2 max-w-sm">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu <span className="font-bold">⋮</span> or Settings <span className="font-bold">⚙️</span></li>
                  <li>Tap <span className="font-semibold text-zinc-200">Linked Devices</span></li>
                  <li>Tap <span className="font-semibold text-zinc-200">Link a Device</span> and point your phone to this screen</li>
                </ol>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-sm text-zinc-400">Waiting for QR Code from server...</p>
              </div>
            )}
          </div>
        )}

        {isReady && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h4 className="text-xl font-bold text-emerald-400 mb-2">WhatsApp is Linked!</h4>
            <p className="text-sm text-emerald-500/80 max-w-md mx-auto">
              Your CRM is now fully connected to WhatsApp. You can seamlessly send messages to your leads directly from the dashboard.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
