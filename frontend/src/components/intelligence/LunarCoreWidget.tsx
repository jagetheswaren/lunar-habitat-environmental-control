import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import * as T from '../../api/types';
import {
  Brain,
  ShieldCheck,
  Send,
  Zap,
  Droplet,
  Wind,
  Wrench,
  Package,
  Activity,
  Sparkles,
} from 'lucide-react';

interface Props {
  onAcknowledgeAlert?: (id: number) => void;
}

export const LunarCoreWidget: React.FC<Props> = () => {
  const [health, setHealth] = useState<T.LunarCoreHealth | null>(null);
  const [, setLoadingHealth] = useState(true);

  // Diagnostic Assistant State
  const [query, setQuery] = useState('');
  const [asking, setAsking] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<T.DiagnosticQueryResult | null>(null);

  const loadHealth = async () => {
    try {
      const data = await api.v2.getHealth();
      setHealth(data);
    } catch {
      // Keep existing state or fallback
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
    overall >= 90 ? 'text-[#10B981]' : overall >= 80 ? 'text-[#06B6D4]' : overall >= 65 ? 'text-[#F59E0B]' : 'text-[#EF4444]';
  const statusBg =
    overall >= 90 ? 'bg-[#10B981]/10 border-[#10B981]/30' : overall >= 80 ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30' : 'bg-[#F59E0B]/10 border-[#F59E0B]/30';

  return (
    <div className="bg-[#111622] border border-[#1E2638] rounded p-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3.5 border-b border-[#1E2638]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#161D2B] border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] flex-shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#F0F4F8] tracking-wider uppercase">
                LUNAR CORE
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 uppercase">
                HEALTH DETERMINISTIC ENGINE V2
              </span>
            </div>
            <p className="text-[11px] text-[#8C9BAE]">
              Autonomous Life Support Health Index & Grounded Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded border ${statusBg} flex items-center gap-2`}>
            <Activity className={`w-3.5 h-3.5 ${statusColor}`} />
            <div>
              <div className="text-[9px] text-[#8C9BAE] uppercase tracking-wider leading-none">
                HABITAT HEALTH INDEX
              </div>
              <div className={`text-base font-bold ${statusColor} leading-tight tabular-nums`}>
                {overall} <span className="text-[10px] text-[#8C9BAE] font-normal">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystems Breakdown Grid (Phase 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3.5">
        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-[#06B6D4]" /> Atmosphere</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.atmosphereScore ?? 95}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#06B6D4] h-1" style={{ width: `${health?.atmosphereScore ?? 95}%` }} />
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><Droplet className="w-3 h-3 text-[#06B6D4]" /> Water</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.waterScore ?? 99}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#06B6D4] h-1" style={{ width: `${health?.waterScore ?? 99}%` }} />
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-[#10B981]" /> Life Support</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.lifeSupportScore ?? 100}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#10B981] h-1" style={{ width: `${health?.lifeSupportScore ?? 100}%` }} />
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#F59E0B]" /> Power</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.powerScore ?? 96}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#F59E0B] h-1" style={{ width: `${health?.powerScore ?? 96}%` }} />
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><Package className="w-3 h-3 text-[#06B6D4]" /> Resources</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.resourcesScore ?? 92}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#06B6D4] h-1" style={{ width: `${health?.resourcesScore ?? 92}%` }} />
          </div>
        </div>

        <div className="p-2 rounded bg-[#0B0E14] border border-[#1E2638]">
          <div className="flex items-center justify-between text-[#8C9BAE] text-[11px] mb-1">
            <span className="flex items-center gap-1.5"><Wrench className="w-3 h-3 text-[#F59E0B]" /> Maintenance</span>
            <span className="text-[#F0F4F8] font-bold tabular-nums">{health?.maintenanceScore ?? 90}</span>
          </div>
          <div className="w-full bg-[#161D2B] rounded h-1 overflow-hidden">
            <div className="bg-[#F59E0B] h-1" style={{ width: `${health?.maintenanceScore ?? 90}%` }} />
          </div>
        </div>
      </div>

      {/* Operational Insights ticker */}
      {health?.operationalInsights && health.operationalInsights.length > 0 && (
        <div className="mb-3 p-2 rounded bg-[#0B0E14] border border-[#1E2638] text-[11px] text-[#06B6D4] flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#06B6D4] mt-0.5 flex-shrink-0" />
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
      <div className="pt-2 border-t border-[#1E2638]">
        <div className="text-[11px] text-[#8C9BAE] font-semibold mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 uppercase">
            <Brain className="w-3.5 h-3.5 text-[#06B6D4]" />
            Operator Diagnostic Query
          </span>
          <span className="text-[10px] text-[#5A677B]">GROUNDED IN LIVE DATABASE</span>
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
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
              className="px-2 py-0.5 rounded text-[10px] bg-[#0B0E14] hover:bg-[#161D2B] hover:text-[#06B6D4] border border-[#1E2638] text-[#8C9BAE] transition-colors"
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
          className="flex items-center gap-2 mb-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query LUNAR CORE diagnostic engine..."
            className="flex-1 bg-[#0B0E14] border border-[#1E2638] rounded px-3 py-1.5 text-xs text-[#F0F4F8] placeholder-[#5A677B] focus:outline-none focus:border-[#06B6D4]"
          />
          <button
            type="submit"
            disabled={asking || !query.trim()}
            className="px-3 py-1.5 rounded bg-[#06B6D4] hover:bg-[#00E5FF] text-[#070A0F] text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            Query
          </button>
        </form>

        {/* Diagnostic Response Panel */}
        {diagnosticResult && (
          <div className="p-3 rounded bg-[#0B0E14] border border-[#06B6D4]/30 text-xs space-y-2 mt-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#1E2638]">
              <span className="text-[#06B6D4] font-semibold uppercase text-[10px]">
                DIAGNOSTIC REPORT: &ldquo;{diagnosticResult.query}&rdquo;
              </span>
              <span className="text-[10px] text-[#8C9BAE] uppercase font-mono">
                STATUS: {diagnosticResult.severity || 'NOMINAL'}
              </span>
            </div>
            <p className="text-[#F0F4F8] text-[11px] leading-relaxed">
              {diagnosticResult.answer}
            </p>
            {diagnosticResult.suggestedActions && diagnosticResult.suggestedActions.length > 0 && (
              <div className="p-2 rounded bg-[#161D2B] border border-[#1E2638] text-[10px] text-[#F59E0B]">
                <span className="font-bold">RECOMMENDED PROTOCOL:</span> {diagnosticResult.suggestedActions.join('; ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
