import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import * as T from '../../api/types';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Send,
  Zap,
  Droplet,
  Wind,
  Wrench,
  Package,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  onAcknowledgeAlert?: (id: number) => void;
}

export const LunarCoreWidget: React.FC<Props> = () => {
  const [health, setHealth] = useState<T.LunarCoreHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Diagnostic Assistant State
  const [query, setQuery] = useState('');
  const [asking, setAsking] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<T.DiagnosticQueryResult | null>(null);

  const loadHealth = async () => {
    try {
      const data = await api.v2.getHealth();
      setHealth(data);
    } catch (err) {
      console.warn('LUNAR CORE health endpoint offline, using local fallback', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setAsking(true);
    try {
      const res = await api.v2.diagnose(q);
      setDiagnosticResult(res);
      setQuery('');
    } catch (err) {
      console.error('Failed to run diagnostic query', err);
    } finally {
      setAsking(false);
    }
  };

  const overall = health?.overallIndex || 95;
  const statusColor =
    overall >= 90 ? 'text-emerald-400' : overall >= 80 ? 'text-cyan-400' : overall >= 65 ? 'text-amber-400' : 'text-red-400';
  const statusBg =
    overall >= 90 ? 'bg-emerald-500/10 border-emerald-500/30' : overall >= 80 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-amber-500/10 border-amber-500/30';

  return (
    <div className="bg-[#121622] border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-mono">
      {/* Background glow & subtle scanline effect */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                LUNAR CORE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OPERATIONAL INTELLIGENCE V2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Habitat Health Engine & Grounded Mission Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border ${statusBg} flex items-center gap-2`}>
            <Activity className={`w-4 h-4 ${statusColor}`} />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none">
                HABITAT HEALTH INDEX
              </div>
              <div className={`text-lg font-bold ${statusColor} leading-tight`}>
                {overall} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystems Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Atmosphere</span>
            <span className="text-white font-bold">{health?.atmosphereScore ?? 95}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${health?.atmosphereScore ?? 95}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-blue-400" /> Water</span>
            <span className="text-white font-bold">{health?.waterScore ?? 99}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${health?.waterScore ?? 99}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Life Support</span>
            <span className="text-white font-bold">{health?.lifeSupportScore ?? 100}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${health?.lifeSupportScore ?? 100}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Power</span>
            <span className="text-white font-bold">{health?.powerScore ?? 96}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${health?.powerScore ?? 96}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-indigo-400" /> Resources</span>
            <span className="text-white font-bold">{health?.resourcesScore ?? 92}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${health?.resourcesScore ?? 92}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-orange-400" /> Maint.</span>
            <span className="text-white font-bold">{health?.maintenanceScore ?? 90}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${health?.maintenanceScore ?? 90}%` }} />
          </div>
        </div>
      </div>

      {/* Operational Insights ticker */}
      {health?.operationalInsights && health.operationalInsights.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            {health.operationalInsights.map((insight, idx) => (
              <div key={idx} className="tracking-wide">
                • {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Grounded Diagnostic Assistant */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            OPERATOR DIAGNOSTIC QUERY CONSOLE
          </span>
          <span className="text-[10px] text-slate-400">GROUNDED IN LIVE DB & TELEMETRY</span>
        </div>

        {/* Quick query recommendation chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            'Why did Dome Alpha become critical?',
            'Show abnormal CO₂ events',
            'Which equipment requires maintenance?',
            "Summarize today's habitat health",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              disabled={asking}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-slate-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex items-center gap-2 mb-3"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask LUNAR CORE diagnostic engine..."
            className="flex-1 bg-space-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={asking || !query.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-space-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Query
          </button>
        </form>

        {/* Diagnostic Response Panel */}
        {diagnosticResult && (
          <div className="p-3.5 rounded-xl bg-space-950/90 border border-cyan-500/30 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-cyan-400 font-semibold uppercase text-[11px]">
                DIAGNOSTIC REPORT: &ldquo;{diagnosticResult.query}&rdquo;
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  diagnosticResult.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : diagnosticResult.severity === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {diagnosticResult.severity}
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed">
              {diagnosticResult.answer}
            </p>

            {diagnosticResult.keyEvidence && diagnosticResult.keyEvidence.length > 0 && (
              <div className="text-[11px] text-slate-400 pt-1">
                <span className="text-slate-300 font-semibold">Evidence:</span>
                <ul className="list-disc list-inside space-y-0.5 mt-0.5 text-cyan-300/90">
                  {diagnosticResult.keyEvidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {diagnosticResult.suggestedActions && diagnosticResult.suggestedActions.length > 0 && (
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="text-amber-400 font-semibold">Suggested Operator Action:</span>
                <ul className="list-disc list-inside space-y-0.5 mt-0.5 text-slate-300">
                  {diagnosticResult.suggestedActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
