"use client";

export default function WhitelabelClient() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">White-Label Management</h1>
        <p className="text-gray-600 mt-1">Configure global branding, custom domains, and visual identities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Global Branding</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input type="text" defaultValue="CRM OS" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color (Hex)</label>
              <div className="flex gap-3">
                <input type="text" defaultValue="#3B82F6" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                <div className="w-12 h-12 rounded-xl bg-blue-500 shrink-0 border border-gray-300"></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-500 transition-colors cursor-pointer">
                <svg className="w-8 h-8 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm text-gray-600">Click to upload or drag and drop SVG/PNG</p>
              </div>
            </div>
            <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Save Branding Options
            </button>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Custom Domains</h2>
          <p className="text-sm text-gray-600 mb-6">Allow tenant companies to map their own domains to your application.</p>
          
          <div className="space-y-4">
            <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">app.acmecorp.com</p>
                <p className="text-xs text-blue-400 mt-1">Status: Active</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-sm text-gray-600 hover:text-gray-900">Configure</button>
            </div>
            
            <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex items-center justify-between opacity-50">
              <div>
                <p className="font-semibold text-gray-900">portal.globex.io</p>
                <p className="text-xs text-amber-500 mt-1">Status: Pending DNS Verification</p>
              </div>
              <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="text-sm text-gray-600 hover:text-gray-900">Verify</button>
            </div>
            
            <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="w-full py-3 border border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500 font-medium rounded-xl transition-all">
              + Register New Domain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
