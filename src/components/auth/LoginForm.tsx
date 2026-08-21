'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Building, KeyRound } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }
      
      toast.success("If your email is registered, an OTP has been sent.");
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        toast.success("Successfully logged in!");
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-2">Welcome back</h1>
        <p className="text-sm text-zinc-400">Enter your credentials to access your workspace.</p>
      </div>

      <form onSubmit={step === 'email' ? handleRequestOtp : handleLogin} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === 'otp' || isLoading}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:opacity-50"
              placeholder="agent@brokerage.com"
            />
          </div>
        </div>

        {/* OTP Input */}
        {step === 'otp' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="otp" className="block text-sm font-medium text-zinc-300">
                One-Time Password (OTP)
              </label>
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Change Email?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="123456"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : step === 'email' ? (
            <>
              Request OTP
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#09090b] text-zinc-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-zinc-800 rounded-xl shadow-sm bg-zinc-900/50 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-zinc-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-zinc-800 rounded-xl shadow-sm bg-zinc-900/50 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-zinc-700">
            <Building className="w-5 h-5 text-zinc-400" />
            Enterprise SSO (SAML)
          </button>
        </div>
      </div>
    </div>
  );
}
