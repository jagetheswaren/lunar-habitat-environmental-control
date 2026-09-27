import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Cpu, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, Sliders, Play, Square } from 'lucide-react';

export const ScrubbersPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>('CO2 SCRUBBER A-01');

  // Control state
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [state, setState] = useState<'ACTIVE' | 'STANDBY'>('ACTIVE');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');

  const fetchData = async () => {
    try {
      const list = await api.telemetry.getAll().catch(() => []);
      setTelemetry(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const inputCo2 = latest?.co2LevelPpm ? Math.round(Number(latest.co2LevelPpm)) : 1280;
  const outputCo2 = Math.round(inputCo2 * 0.48);

  const units = [
    {
      id: 'CO2 SCRUBBER A-01',
      zone: 'DOME ALPHA',
      mode: mode,
      state: state,
      inputCo2: `${inputCo2} ppm`,
      outputCo2: `${outputCo2} ppm`,
      filterLife: '73%',
      flowRate: '420 LPM',
      nextService: '48h (SOL 0192)',
      efficiency: '94.2%',
    },
    {
      id: 'CO2 SCRUBBER B-02',
      zone: 'HYDROPONICS BETA',
      mode: 'AUTO',
      state: 'STANDBY',
      inputCo2: '410 ppm',
      outputCo2: '210 ppm',
      filterLife: '89%',
      flowRate: '350 LPM',
      nextService: '120h (SOL 0195)',
      efficiency: '96.5%',
    },
    {
      id: 'AUXILIARY SCRUBBER C-03',
      zone: 'ECLSS RECLAMATION',
      mode: 'AUTO',
      state: 'STANDBY',
      inputCo2: '380 ppm',
      outputCo2: '180 ppm',
      filterLife: '94%',
      flowRate: '500 LPM',
      nextService: '240h (SOL 0200)',
      efficiency: '97.1%',
    },
  ];

  const currentUnit = units.find(u => u.id === selectedUnit) || units[0];

  const handleToggleMode = () => {
    if (mode === 'AUTO') {
      setPendingAction('SWITCH TO MANUAL OVERRIDE MODE');
      setShowOverrideConfirm(true);
    } else {
      setMode('AUTO');
    }
  };

  const handleToggleState = () => {
    if (mode === 'AUTO') {
      alert('CANNOT TOGGLE EQUIPMENT DIRECTLY IN AUTO MODE. SWITCH TO MANUAL OVERRIDE FIRST.');
      return;
    }
    setPendingAction(`TOGGLE EQUIPMENT STATE TO ${state === 'ACTIVE' ? 'STANDBY' : 'ACTIVE'}`);
    setShowOverrideConfirm(true);
  };

  const confirmAction = () => {
    if (pendingAction.includes('MANUAL OVERRIDE')) {
      setMode('MANUAL');
    } else if (pendingAction.includes('TOGGLE EQUIPMENT STATE')) {
      setState(s => (s === 'ACTIVE' ? 'STANDBY' : 'ACTIVE'));
    }
    setShowOverrideConfirm(false);
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="CO2 CATALYTIC SCRUBBER EQUIPMENT CONTROL"
        subtitle="SCADA EQUIPMENT SUITE // HYDROXIDE ABSORPTION LOOPS & AUTONOMOUS DISPATCH"
        icon={Cpu}
        badge="SCADA CONTROL"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        }
      />

      {/* Equipment Selector Strip */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111820] border border-[#283443] rounded overflow-x-auto text-[11px]">
        {units.map(unit => (
          <button
            key={unit.id}
            onClick={() => setSelectedUnit(unit.id)}
            className={`px-3 py-1.5 rounded font-bold uppercase transition-colors whitespace-nowrap border ${
              selectedUnit === unit.id
                ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                : 'bg-[#0C1118] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
            }`}
          >
            {unit.id} ({unit.zone})
          </button>
        ))}
      </div>

      {/* Main SCADA Equipment Console */}
      <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-4">
        {/* Unit Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#283443]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#F1F4F6] uppercase tracking-wider">
                {currentUnit.id}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#161F2A] text-[#06B6D4] border border-[#283443] font-bold">
                {currentUnit.zone}
              </span>
            </div>
            <p className="text-[10px] text-[#657184] uppercase mt-0.5">
              CATALYTIC REGENERATIVE LIQUID AMINE / LITHIUM HYDROXIDE CYCLING
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMode}
              className={`px-3 py-1.5 rounded font-bold uppercase transition-colors border ${
                currentUnit.mode === 'MANUAL'
                  ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                  : 'bg-[#161F2A] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
              }`}
            >
              MODE: {currentUnit.mode}
            </button>

            <button
              onClick={handleToggleState}
              className={`px-3 py-1.5 rounded font-bold uppercase transition-colors border ${
                currentUnit.state === 'ACTIVE'
                  ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                  : 'bg-[#161F2A] border-[#283443] text-[#64748B]'
              }`}
            >
              STATE: {currentUnit.state}
            </button>
          </div>
        </div>

        {/* Technical Instrument Readings */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">INPUT CO2</span>
            <span
              className={`text-xl font-bold tabular-nums ${
                inputCo2 > 1000 ? 'text-[#EF4444]' : inputCo2 > 800 ? 'text-[#F59E0B]' : 'text-[#F1F4F6]'
              }`}
            >
              {currentUnit.inputCo2}
            </span>
            <span className="text-[9px] text-[#657184] block mt-0.5">PRE-TREATMENT</span>
          </div>

          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">OUTPUT CO2</span>
            <span className="text-xl font-bold text-[#10B981] tabular-nums">{currentUnit.outputCo2}</span>
            <span className="text-[9px] text-[#657184] block mt-0.5">POST-SCRUBBED</span>
          </div>

          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">FILTER LIFE</span>
            <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{currentUnit.filterLife}</span>
            <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL LIFE</span>
          </div>

          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">FLOW RATE</span>
            <span className="text-xl font-bold text-[#F1F4F6] tabular-nums">{currentUnit.flowRate}</span>
            <span className="text-[9px] text-[#657184] block mt-0.5">BLOWER SPEED: 92%</span>
          </div>

          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">NEXT SERVICE</span>
            <span className="text-sm font-bold text-[#F59E0B] tabular-nums mt-1 block">
              {currentUnit.nextService}
            </span>
          </div>

          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[10px] text-[#657184] uppercase block font-bold">EFFICIENCY</span>
            <span className="text-xl font-bold text-[#10B981] tabular-nums">{currentUnit.efficiency}</span>
            <span className="text-[9px] text-[#657184] block mt-0.5">CATALYSIS COEFF</span>
          </div>
        </div>

        {/* Warning callout for Manual Override */}
        {currentUnit.mode === 'MANUAL' && (
          <div className="p-3 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                MANUAL OVERRIDE ACTIVE // AUTONOMOUS LIFE-SUPPORT BALANCING ENGINE DISENGAGED FOR THIS UNIT.
              </span>
            </div>
            <button
              onClick={() => setMode('AUTO')}
              className="px-2.5 py-1 rounded bg-[#F59E0B] text-[#080B10] font-bold uppercase text-[10px]"
            >
              RESTORE AUTO
            </button>
          </div>
        )}
      </div>

      {/* Safety Override Confirmation Modal */}
      {showOverrideConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-[#111820] border border-[#EF4444]/60 rounded max-w-md w-full p-4 space-y-3 font-mono text-xs shadow-2xl">
            <div className="flex items-center gap-2 pb-2 border-b border-[#283443] text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold uppercase tracking-wider">
                CONFIRM LIFE-SUPPORT OVERRIDE
              </span>
            </div>

            <p className="text-[#F1F4F6]">
              You are about to execute: <strong className="text-[#06B6D4]">{pendingAction}</strong> on equipment{' '}
              <strong className="text-[#F1F4F6]">{currentUnit.id}</strong>.
            </p>

            <p className="text-[11px] text-[#98A3B3]">
              Safety regulation ECLSS-STD-402 requires operator authorization. Manual intervention overrides autonomous safety cycles.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#283443]">
              <button
                onClick={() => setShowOverrideConfirm(false)}
                className="px-3 py-1.5 rounded bg-[#161F2A] text-[#98A3B3] hover:text-[#F1F4F6] uppercase text-[10px]"
              >
                CANCEL
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-1.5 rounded bg-[#EF4444] text-white font-bold uppercase text-[10px] hover:bg-[#EF4444]/90"
              >
                AUTHORIZE OVERRIDE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
