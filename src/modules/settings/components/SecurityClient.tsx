"use client";

export default function SecurityClient() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security & API Management</h1>
        <p className="text-gray-600 mt-1">Enforce global security policies and manage tenant API access limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security Policies</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Require 2FA Globally</p>
                <p className="text-xs text-gray-500 mt-1">Force all users across all tenants to use 2FA.</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Strict Session Timeout</p>
                <p className="text-xs text-gray-500 mt-1">Automatically log users out after 15 minutes of inactivity.</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Complexity Regex</label>
              <input type="text" defaultValue="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">API Management</h2>
          <div className="space-y-5">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Global Rate Limit (Req/min)</label>
              <input type="number" defaultValue="1000" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div className="pt-2">
               <h3 className="text-sm font-semibold text-gray-900 mb-3">API Keys Created by Tenants</h3>
               <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg flex justify-between items-center">
                 <span className="text-sm text-gray-700">Acme Corp Integration Key</span>
                 <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Active</span>
               </div>
               <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg flex justify-between items-center mt-2">
                 <span className="text-sm text-gray-700">Globex Zapier Link</span>
                 <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
