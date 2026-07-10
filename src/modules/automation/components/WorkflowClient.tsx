"use client";

export default function WorkflowClient() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workflow Engine Configurator</h1>
        <p className="text-gray-600 mt-1">Design global event triggers, execution queues, and background jobs.</p>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">Execution Pipelines</h2>
          <button onClick={() => alert("This feature is currently in development and will be available in the next release!")} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white rounded-lg transition-colors">
            + New Pipeline
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Event-Driven Queue</h3>
                <p className="text-xs text-gray-500">Processes webhooks and immediate actions (e.g., Stripe Payments)</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active (34 req/s)
              </span>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CRON Background Jobs</h3>
                <p className="text-xs text-gray-500">Scheduled batch processing (e.g., Daily Analytics, Invoice Generation)</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                Idle
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
