"use client";

export default function SettingsClient() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Settings & Templates</h1>
        <p className="text-gray-600 mt-1">Configure systemic variables, maintenance modes, and industry templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div>
                <p className="font-semibold text-amber-500">Maintenance Mode</p>
                <p className="text-xs text-amber-400/80 mt-1">Locks all non-owners out of the CRM.</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Global Currency</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Industry Templates</h2>
          <p className="text-sm text-gray-600 mb-6">Pre-packaged modules and dynamic fields designed for specific verticals.</p>
          
          <div className="space-y-4">
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Real Estate CRM</p>
                <p className="text-xs text-gray-600 mt-1">Includes Properties, Listings, Agents</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Edit Config</button>
            </div>
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">IT Agency CRM</p>
                <p className="text-xs text-gray-600 mt-1">Includes Tickets, SLAs, Assets</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-sm text-blue-400 hover:text-blue-300 font-medium">Edit Config</button>
            </div>
            <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-medium rounded-xl transition-all">
              + Scaffold New Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
