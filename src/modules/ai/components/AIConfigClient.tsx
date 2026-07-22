"use client";

import { useState, useEffect } from "react";

export default function AIConfigClient() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [openAIModel, setOpenAIModel] = useState("gpt-4o");
  
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("claude-3-opus-20240229");

  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");

  const [loading, setLoading] = useState(true);
  const [testingOAI, setTestingOAI] = useState(false);
  const [testingANT, setTestingANT] = useState(false);
  const [testingGROQ, setTestingGROQ] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      // First fetch session to see if user is platform owner
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.hierarchyLevel === 1) {
          setIsPlatformOwner(true);
        }
      }

      const res = await fetch("/api/settings/ai_config");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.openAIKey) setOpenAIKey(data.value.openAIKey);
          if (data.value.openAIModel) setOpenAIModel(data.value.openAIModel);
          if (data.value.anthropicKey) setAnthropicKey(data.value.anthropicKey);
          if (data.value.anthropicModel) setAnthropicModel(data.value.anthropicModel);
          if (data.value.groqKey) setGroqKey(data.value.groqKey);
          if (data.value.groqModel) setGroqModel(data.value.groqModel);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function testAndSave(provider: "openai" | "anthropic" | "groq") {
    const key = provider === "openai" ? openAIKey : provider === "anthropic" ? anthropicKey : groqKey;
    const model = provider === "openai" ? openAIModel : provider === "anthropic" ? anthropicModel : groqModel;
    
    if (!key) {
      alert(`Please enter a valid ${provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Groq"} key first.`);
      return;
    }

    // Set loading states
    if (provider === "openai") setTestingOAI(true);
    else if (provider === "anthropic") setTestingANT(true);
    else setTestingGROQ(true);

    try {
      // 1. Test Connection
      const testRes = await fetch("/api/settings/ai_config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key, model })
      });

      const testData = await testRes.json();
      if (!testRes.ok || !testData.success) {
        alert(`API Connection Failed: ${testData.error || "Invalid Key"}`);
        return;
      }

      // 2. If test passes, save the configuration
      const saveRes = await fetch("/api/settings/ai_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: isPlatformOwner, // Platform owners save globally, tenants save locally (BYOK)
          value: { openAIKey, openAIModel, anthropicKey, anthropicModel, groqKey, groqModel }
        })
      });

      if (saveRes.ok) {
        alert("Connection successful! Configuration securely saved.");
      } else {
        alert("Failed to save configuration to database.");
      }
    } catch (e) {
      console.error(e);
      alert("Error testing or saving configuration.");
    } finally {
      if (provider === "openai") setTestingOAI(false);
      else if (provider === "anthropic") setTestingANT(false);
      else setTestingGROQ(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Module Configuration</h1>
        <p className="text-gray-600 mt-1">Configure global LLM providers, model limits, and semantic engines.</p>
        {!isPlatformOwner && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
            <strong>Tenant Mode (BYOK):</strong> You are configuring these AI keys exclusively for your own company. This will override the platform's global default keys.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* OpenAI Section */}
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
              <input 
                type="password" 
                placeholder="sk-..." 
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none transition-all font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Completion Model</label>
              <select 
                value={openAIModel}
                onChange={(e) => setOpenAIModel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#10a37f] focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              </select>
            </div>
            <button 
              onClick={() => testAndSave("openai")} 
              disabled={testingOAI}
              className="w-full py-3 bg-[#10a37f] hover:bg-[#0e906f] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#10a37f]/20 mt-4 disabled:opacity-70 flex justify-center items-center"
            >
              {testingOAI ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Testing...</>
              ) : "Test Connection & Save"}
            </button>
          </div>
        </div>

        {/* Anthropic Section */}
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
              <input 
                type="password" 
                placeholder="sk-ant-..." 
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all font-mono text-sm" 
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Claude Model</label>
              <select 
                value={anthropicModel}
                onChange={(e) => setAnthropicModel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-[#D97757] focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
                <option value="claude-3-sonnet-20240229">claude-3-sonnet-20240229</option>
                <option value="claude-3-haiku-20240307">claude-3-haiku-20240307</option>
              </select>
            </div>
            <button 
              onClick={() => testAndSave("anthropic")} 
              disabled={testingANT}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-900 text-white font-semibold rounded-xl transition-all mt-4 disabled:opacity-70 flex justify-center items-center"
            >
              {testingANT ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Testing...</>
              ) : "Test Connection & Save"}
            </button>
          </div>
        </div>

        {/* Groq Section */}
        <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl lg:col-span-2 max-w-2xl mx-auto w-full">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
              <span className="text-orange-600 font-bold text-xs">GRQ</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Groq Integration (Free AI)</h2>
              <p className="text-xs text-gray-500 mt-1">Get a free API key at <a href="https://console.groq.com" target="_blank" className="text-indigo-600 hover:underline">console.groq.com</a></p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input 
                type="password" 
                placeholder="gsk_..." 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-mono text-sm" 
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Llama Model</label>
              <select 
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none"
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Recommended)</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              </select>
            </div>
            <button 
              onClick={() => testAndSave("groq")} 
              disabled={testingGROQ}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all mt-4 disabled:opacity-70 flex justify-center items-center shadow-lg shadow-orange-500/20"
            >
              {testingGROQ ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Testing...</>
              ) : "Test Connection & Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
