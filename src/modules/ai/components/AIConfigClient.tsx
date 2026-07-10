"use client";

export default function AIConfigClient() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Module Configuration</h1>
        <p className="text-gray-600 mt-1">Configure global LLM providers, model limits, and semantic engines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#10a37f]/20 flex items-center justify-center border border-[#10a37f]/30">
              <span className="text-[#10a37f] font-bold text-xs">OAI</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">OpenAI Integration</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" defaultValue="sk-........................" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Completion Model</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none transition-all appearance-none">
                <option>gpt-4o</option>
                <option>gpt-4-turbo</option>
                <option>gpt-3.5-turbo</option>
              </select>
            </div>
            <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="w-full py-3 bg-[#10a37f] hover:bg-[#0e906f] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#10a37f]/20 mt-4">
              Validate & Save
            </button>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#D97757]/20 flex items-center justify-center border border-[#D97757]/30">
              <span className="text-[#D97757] font-bold text-xs">ANT</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Anthropic Integration</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input type="password" placeholder="sk-ant-..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all font-mono text-sm" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Claude Model</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all appearance-none">
                <option>claude-3-opus-20240229</option>
                <option>claude-3-sonnet-20240229</option>
                <option>claude-3-haiku-20240307</option>
              </select>
            </div>
            <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-900 text-white font-semibold rounded-xl transition-all mt-4">
              Validate & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
