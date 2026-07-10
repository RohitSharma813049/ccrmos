"use client";

import { useState, useEffect } from "react";

export default function AIConfigClient() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [openAIModel, setOpenAIModel] = useState("gpt-4o");
  
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("claude-3-opus-20240229");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings/ai_config");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          if (data.value.openAIKey) setOpenAIKey(data.value.openAIKey);
          if (data.value.openAIModel) setOpenAIModel(data.value.openAIModel);
          if (data.value.anthropicKey) setAnthropicKey(data.value.anthropicKey);
          if (data.value.anthropicModel) setAnthropicModel(data.value.anthropicModel);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    try {
      const res = await fetch("/api/settings/ai_config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: true, // Only Platform Owner should set global AI keys
          value: { openAIKey, openAIModel, anthropicKey, anthropicModel }
        })
      });
      if (res.ok) {
        alert("AI Configuration validated and saved securely.");
      } else {
        alert("Failed to save configuration.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving configuration.");
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Module Configuration</h1>
        <p className="text-gray-600 mt-1">Configure global LLM providers, model limits, and semantic engines.</p>
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
            <button onClick={saveConfig} className="w-full py-3 bg-[#10a37f] hover:bg-[#0e906f] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#10a37f]/20 mt-4">
              Validate & Save
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
            <button onClick={saveConfig} className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-900 text-white font-semibold rounded-xl transition-all mt-4">
              Validate & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
