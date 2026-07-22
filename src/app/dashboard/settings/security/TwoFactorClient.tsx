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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading security settings...</div>;

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl max-w-2xl mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Personal Two-Factor Authentication (2FA)</h2>
          <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account using an authenticator app.</p>
        </div>
        <div>
          {twoFactorEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
              Disabled
            </span>
          )}
        </div>
      </div>

      {twoFactorEnabled ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Two-factor authentication is currently active. You will be required to enter a code from your authenticator app when logging in.</p>
          <button 
            onClick={disable2FA}
            disabled={actionLoading}
            className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {actionLoading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      ) : setupMode ? (
        <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Scan the QR Code</h3>
            <p className="text-sm text-gray-600 mb-4">Open your authenticator app (e.g. Google Authenticator, Authy) and scan this QR code.</p>
            {qrCodeUrl && (
              <div className="bg-white p-4 inline-block rounded-xl border border-gray-200 shadow-sm">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Manual entry secret: <span className="font-mono bg-gray-200 px-1 py-0.5 rounded text-gray-800">{secret}</span></p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Enter Verification Code</h3>
            <p className="text-sm text-gray-600 mb-3">Enter the 6-digit code generated by your app to verify setup.</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-32 text-center tracking-widest text-lg"
              />
              <button 
                onClick={verifyAndEnable}
                disabled={actionLoading || verificationCode.length !== 6}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setSetupMode(false)}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Cancel Setup
          </button>
        </div>
      ) : (
        <div>
          <button 
            onClick={beginSetup}
            disabled={actionLoading}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {actionLoading ? "Loading..." : "Set up 2FA"}
          </button>
        </div>
      )}
    </div>
  );
}
