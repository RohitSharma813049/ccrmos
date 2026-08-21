'use client'

import React, { useState } from 'react'
import { AudioLines, Sparkles, AlertCircle, PlayCircle, Lightbulb } from 'lucide-react'

const examplePrompts = [
  "Thunder and lightning storm with heavy rain",
  "Door creaking open slowly in haunted house",
  "Footsteps on wooden floor getting closer",
  "Ocean waves crashing on rocky shore",
  "Birds chirping in peaceful forest morning",
  "Car engine starting and revving",
  "Glass window shattering",
  "Strong wind howling through trees",
  "Crowd cheering and applauding",
  "Fire crackling in fireplace",
  "Phone ringing old style",
  "Sword slashing through air"
]

export default function SoundEffectPage() {
  const [duration, setDuration] = useState(5)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/ai/sound-effect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, duration_seconds: duration })
      });

      if (res.status === 503) {
        // Mock fallback if API key is missing
        await new Promise(r => setTimeout(r, 2000));
        setError("ElevenLabs API Key is missing. This is a mock response.");
        setAudioUrl("https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg");
        setIsGenerating(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
          <AudioLines className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Sound Effect Generator</h1>
          <p className="text-zinc-400 text-sm">Create custom sound effects using AI (ElevenLabs)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/60 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-fuchsia-500" />
              <h2 className="font-semibold text-zinc-100 text-lg">Generate Sound Effect</h2>
            </div>

            <div className="space-y-6">
              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Describe the sound effect <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-zinc-700/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 resize-none"
                  placeholder="e.g., Thunder and lightning storm with heavy rain"
                ></textarea>
                <p className="text-xs text-slate-400 mt-2">
                  Be specific and descriptive about the sound you want to create
                </p>
              </div>

              {/* Slider */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-4">
                  Duration: {duration} seconds
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-medium">0.5s (min)</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="22" 
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                  <span className="text-xs text-slate-400 font-medium">22s (max)</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              {/* Warning Alert */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-sm">Generation takes time</h4>
                  <p className="text-amber-700/80 text-sm mt-1">
                    Sound effects can take 30-60 seconds to generate. Longer durations take more time.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-fuchsia-400 to-pink-500 hover:from-fuchsia-500 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                   <span className="animate-pulse">Generating Audio...</span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Sound Effect
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-fuchsia-50/50 rounded-2xl p-6 border border-fuchsia-100">
            <h3 className="font-semibold text-zinc-100 mb-4">Example Prompts</h3>
            <div className="space-y-2">
              {examplePrompts.map((p, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setPrompt(p)}
                  className="bg-zinc-900/40 backdrop-blur-xl px-4 py-3 rounded-lg border border-fuchsia-100/50 text-sm text-zinc-400 shadow-sm cursor-pointer hover:border-fuchsia-300 transition-colors"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Generated Sound Empty State */}
          <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/60 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <AudioLines className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold text-zinc-100 text-lg">Generated Sound</h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              {audioUrl ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-fuchsia-100 rounded-full flex items-center justify-center text-fuchsia-500 mb-2">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-zinc-300">Sound Ready!</h3>
                  <audio controls src={audioUrl} className="w-full max-w-[250px]" autoPlay></audio>
                  <a href={audioUrl} download="sound-effect.mp3" className="mt-2 text-sm text-fuchsia-600 hover:underline">Download MP3</a>
                </div>
              ) : isGenerating ? (
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="font-semibold text-zinc-400">Creating magic...</h3>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-950/50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-300">No sound effect yet</h3>
                    <p className="text-sm text-slate-400 mt-1">Enter a description and generate</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-zinc-100">Best Practices</h3>
            </div>
            <ul className="space-y-3 text-sm text-blue-900/80">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Use descriptive language with details about intensity and environment
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Include context: "wooden door creaking" vs just "door"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Mention speed/rhythm: "fast footsteps" or "slow dripping"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                3-8 seconds is ideal for most sound effects
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Be patient - quality sounds take time to generate
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
