"use client";

import { useState, useEffect } from "react";

export default function TwoFactorClient() {
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  async function fetchUserSettings() {
    try {
      const res = await fetch("/api/auth/2fa/status");
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.enabled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function beginSetup() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setSetupMode(true);
      } else {
        alert("Failed to initialize 2FA setup");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function verifyAndEnable() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, disable: false }),
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setSetupMode(false);
        setVerificationCode("");
        alert("2FA enabled successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Invalid code");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  async function disable2FA() {
    const code = prompt("Enter 2FA code to disable:");
    if (!code) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, disable: true }),
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        alert("2FA disabled successfully");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to disable 2FA");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading security settings...</div>;

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-xl max-w-2xl mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Personal Two-Factor Authentication (2FA)</h2>
          <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account using an authenticator app.</p>
        </div>
        <div>
          {twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground border border-border">
              Disabled
            </span>
          )}
        </div>
      </div>

      {twoFactorEnabled ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">Two-factor authentication is currently active. You will be required to enter a code from your authenticator app when logging in.</p>
          <button 
            onClick={disable2FA}
            disabled={actionLoading}
            className="px-4 py-2 border border-destructive/20 text-destructive bg-destructive/10 hover:bg-destructive/20 font-medium rounded-xl transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive inline-flex items-center gap-2"
          >
            {actionLoading && (
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {actionLoading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      ) : setupMode ? (
        <div className="space-y-6 bg-background p-6 rounded-xl border border-border shadow-sm">
          <div>
            <h3 className="font-semibold text-foreground mb-2">1. Scan the QR Code</h3>
            <p className="text-sm text-muted-foreground mb-4">Open your authenticator app (e.g. Google Authenticator, Authy) and scan this QR code.</p>
            {qrCodeUrl && (
              <div className="bg-zinc-900/40 backdrop-blur-xl p-4 inline-block rounded-xl border border-border shadow-sm">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Manual entry secret: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{secret}</span></p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">2. Enter Verification Code</h3>
            <p className="text-sm text-muted-foreground mb-3">Enter the 6-digit code generated by your app to verify setup.</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none w-32 text-center tracking-widest text-lg text-foreground shadow-sm"
              />
              <button 
                onClick={verifyAndEnable}
                disabled={actionLoading || verificationCode.length !== 6}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
              >
                {actionLoading && (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {actionLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setSetupMode(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Cancel Setup
          </button>
        </div>
      ) : (
        <div>
          <button 
            onClick={beginSetup}
            disabled={actionLoading}
            className="px-6 py-2.5 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
          >
            {actionLoading && (
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {actionLoading ? "Loading..." : "Set up 2FA"}
          </button>
        </div>
      )}
    </div>
  );
}
