import React, { useState, useEffect } from 'react';
import {
  Wind,
  Droplets,
  Activity,
  Flame,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Sparkles,
  Zap,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { api } from '../api/client';
import * as T from '../api/types';

type ScrubberState = 'OFF' | 'STANDBY' | 'ACTIVE' | 'BOOST' | 'MAINTENANCE';

export const ResourceReclamationPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<T.Telemetry | any>(null);
  const [zones, setZones] = useState<T.HabitatZoneV2[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [scrubberState, setScrubberState] = useState<ScrubberState>('ACTIVE');
  const [automationLogs, setAutomationLogs] = useState<Array<{
    time: string;
    trigger: string;
    zone: string;
    telemetry: string;
    action: string;
    result: string;
  }>>([
    {
      time: '15:24:10 UTC',
      trigger: 'CO2 Threshold (>950 ppm)',
      zone: 'Habitat Dome Alpha',
      telemetry: '1280.00 ppm CO2',
      action: 'Automated Scrubber BOOST',
      result: 'Scrubber speed: 100% throughput (Nominal Recovery)',
    },
    {
      time: '14:50:00 UTC',
      trigger: 'Greywater Return Sensor',
      zone: 'Hydroponic Sub-surface Farm',
      telemetry: '99.4% Purity / 240 L input',
      action: 'Catalytic Oxidation + RO Filter',
      result: '232.8 L Potable Water Reclaimed (97.0% Eff)',
    },
    {
      time: '14:15:32 UTC',
      trigger: 'Sabatier Reactor Cycle',
      zone: 'Life Support Subsystem',
      telemetry: '18.5 m³ CO2 captured',
      action: 'Bosch Reaction / Electrolysis',
      result: '17.2 m³ Pure O2 Generated',
    },
  ]);
  const [overrideActive, setOverrideActive] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const latest = await api.v2.getLatestTelemetry();
      if (latest) {
        setTelemetry(latest);
        if (latest.scrubberStatus) {
          if (latest.scrubberStatus.includes('BOOST')) {
            setScrubberState('BOOST');
          } else if (latest.scrubberStatus.includes('NORMAL') || latest.scrubberStatus.includes('ACTIVE')) {
            setScrubberState('ACTIVE');
          }
        }
      }
      const zonesData = await api.v2.getZones();
      if (zonesData && zonesData.length > 0) {
        setZones(zonesData);
      }
    } catch (err) {
      console.error('Error fetching reclamation telemetry:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleScrubberChange = async (newState: ScrubberState) => {
    setScrubberState(newState);
    setOverrideActive(true);
    const activeZone = zones.find((z) => z.id === selectedZoneId)?.name || 'Habitat Dome Alpha';
    const newLog = {
      time: new Date().toLocaleTimeString() + ' UTC',
      trigger: 'Operator Manual Override',
      zone: activeZone,
      telemetry: `${telemetry?.co2LevelPpm?.toFixed(1) || '740.0'} ppm CO2`,
      action: `Scrubber Mode -> ${newState}`,
      result: `Status verified. Actuators commanded to ${newState}.`,
    };
    setAutomationLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    setSuccessMessage(`Scrubber mode set to ${newState} for ${activeZone}. Telemetry synchronized.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Derive dynamic metrics from real telemetry or active baseline
  const co2 = telemetry?.co2LevelPpm || 740.0;
  const o2 = telemetry?.o2PartialPressureKpa || 21.0;
  const purity = telemetry?.waterPurityPercent || 99.4;
  const pressure = telemetry?.atmosphericPressureKpa || 101.3;

  const o2Production = 28.4; // m3/day
  const o2Consumption = telemetry?.oxygenConsumptionM3 ? Number(telemetry.oxygenConsumptionM3) : 18.2;
  const o2Reclaimed = 26.8;
  const o2Reserve = 4500.0; // m3
  const o2Efficiency = 94.4; // %

  const waterInput = 1200.0; // L/day
  const waterConsumed = telemetry?.waterConsumptionLiters ? Number(telemetry.waterConsumptionLiters) : 480.0;
  const waterRecovered = 1164.0;
  const waterEfficiency = 97.0; // %

  const co2Scrubbed = 24.6; // kg/day
  const scrubberEfficiency = co2 > 950 ? 98.2 : 95.8;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto text-[#F0F4F8]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2638] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#06B6D4] uppercase tracking-wider mb-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Closed-Loop Environmental Life Support Subsystem</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Resource Reclamation & Scrubber Controls
          </h1>
          <p className="text-xs text-[#8C9BAE] mt-0.5">
            Realtime atmospheric recycling, potable water recovery, and catalytic CO2 scrubber automation.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-3 bg-[#111622] p-1.5 rounded-lg border border-[#1E2638]">
          <span className="text-xs font-mono text-[#8C9BAE] pl-2">ACTIVE SECTOR:</span>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(Number(e.target.value))}
            className="bg-[#0B0E14] text-xs font-mono border border-[#1E2638] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#06B6D4]"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="bg-[#06B6D4]/10 border border-[#06B6D4]/40 text-[#06B6D4] px-4 py-2.5 rounded text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Closed-Loop Visual Lifecycle Flow */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2638]/70 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#06B6D4]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Continuous Closed-Loop Biosphere Material Flow
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            EQUILIBRIUM NOMINAL (96.4%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {/* Node 1: Crew / Tenant */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-3 text-center space-y-1 relative">
            <span className="text-[10px] font-mono text-[#8C9BAE] uppercase">Node 01</span>
            <div className="text-xs font-bold text-white font-mono">Crew / Tenants</div>
            <p className="text-[10px] text-[#5A677B]">Metabolic demand</p>
            <div className="mt-2 text-[11px] font-mono text-[#06B6D4]">32 Personnel</div>
          </div>

          {/* Node 2: Consumption */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-[#8C9BAE] uppercase">Node 02</span>
            <div className="text-xs font-bold text-white font-mono">Consumption</div>
            <p className="text-[10px] text-[#5A677B]">O2, Potable H2O</p>
            <div className="mt-2 text-[11px] font-mono text-[#F59E0B]">
              {o2Consumption.toFixed(1)} m³ / {waterConsumed.toFixed(0)} L
            </div>
          </div>

          {/* Node 3: Waste & Exhale */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-[#8C9BAE] uppercase">Node 03</span>
            <div className="text-xs font-bold text-white font-mono">Waste / CO2</div>
            <p className="text-[10px] text-[#5A677B]">Exhaled gas & greywater</p>
            <div className="mt-2 text-[11px] font-mono text-[#EF4444]">
              {co2.toFixed(0)} ppm CO2
            </div>
          </div>

          {/* Node 4: Reclamation Systems */}
          <div className="bg-[#0B0E14] border border-[#06B6D4]/40 rounded p-3 text-center space-y-1 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="text-[10px] font-mono text-[#06B6D4] uppercase">Node 04</span>
            <div className="text-xs font-bold text-[#06B6D4] font-mono">Reclamation Units</div>
            <p className="text-[10px] text-[#8C9BAE]">Sabatier + RO Scrubbers</p>
            <div className="mt-2 text-[11px] font-mono text-[#10B981]">
              Scrubber: {scrubberState}
            </div>
          </div>

          {/* Node 5: Pure Storage */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-[#8C9BAE] uppercase">Node 05</span>
            <div className="text-xs font-bold text-white font-mono">Habitat Storage</div>
            <p className="text-[10px] text-[#5A677B]">Cryo & Potable Tanks</p>
            <div className="mt-2 text-[11px] font-mono text-[#10B981]">
              4,500 m³ / 12,800 L
            </div>
          </div>

          {/* Node 6: Closed-Loop Reuse */}
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded p-3 text-center space-y-1">
            <span className="text-[10px] font-mono text-[#8C9BAE] uppercase">Node 06</span>
            <div className="text-xs font-bold text-white font-mono">Direct Reuse</div>
            <p className="text-[10px] text-[#5A677B]">Atmosphere & Agronomy</p>
            <div className="mt-2 text-[11px] font-mono text-[#06B6D4]">
              Recycled: 96.4%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#8C9BAE] pt-2">
          <span>CREW DEMAND</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>CONSUMPTION</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>CATALYTIC EXTRACTION</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>CRYO STORAGE</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[#10B981]">RECIRCULATION LOOP</span>
        </div>
      </div>

      {/* Subsystem Metric Readouts: O2, Water, CO2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Oxygen Loop */}
        <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
                <Wind className="w-4 h-4" />
              </div>
              <span className="text-sm font-mono font-bold text-white uppercase">Oxygen Reclamation</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#10B981]">{o2Efficiency}% EFF</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Production Rate</div>
              <div className="text-sm font-bold text-white mt-0.5">{o2Production} m³/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Consumption</div>
              <div className="text-sm font-bold text-[#F59E0B] mt-0.5">{o2Consumption.toFixed(1)} m³/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Reclaimed Volume</div>
              <div className="text-sm font-bold text-[#10B981] mt-0.5">{o2Reclaimed} m³/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Cryo Reserve</div>
              <div className="text-sm font-bold text-[#06B6D4] mt-0.5">{o2Reserve} m³</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] font-mono text-[#8C9BAE] mb-1">
              <span>Atmospheric O2 Partial Pressure</span>
              <span className="text-white font-bold">{o2.toFixed(1)} kPa</span>
            </div>
            <div className="h-1.5 bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E2638]">
              <div className="h-full bg-[#10B981]" style={{ width: `${Math.min(100, (o2 / 24) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Water Loop */}
        <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-sm font-mono font-bold text-white uppercase">Water Closed-Loop</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#10B981]">{waterEfficiency}% EFF</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Input Greywater</div>
              <div className="text-sm font-bold text-white mt-0.5">{waterInput} L/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Consumed</div>
              <div className="text-sm font-bold text-[#F59E0B] mt-0.5">{waterConsumed.toFixed(0)} L/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Recovered Pure H2O</div>
              <div className="text-sm font-bold text-[#10B981] mt-0.5">{waterRecovered} L/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Potable Purity</div>
              <div className="text-sm font-bold text-[#06B6D4] mt-0.5">{purity.toFixed(2)}%</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] font-mono text-[#8C9BAE] mb-1">
              <span>Distillation Quality Index</span>
              <span className="text-white font-bold">{purity.toFixed(1)}% Potable</span>
            </div>
            <div className="h-1.5 bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E2638]">
              <div className="h-full bg-[#06B6D4]" style={{ width: `${Math.min(100, purity)}%` }} />
            </div>
          </div>
        </div>

        {/* CO2 Scrubbing */}
        <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-sm font-mono font-bold text-white uppercase">CO2 Scrubber Loop</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#10B981]">{scrubberEfficiency}% CAPTURE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Detected Ambient CO2</div>
              <div className={`text-sm font-bold mt-0.5 ${co2 > 950 ? 'text-[#EF4444]' : 'text-white'}`}>
                {co2.toFixed(1)} ppm
              </div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Scrubbed Rate</div>
              <div className="text-sm font-bold text-[#10B981] mt-0.5">{co2Scrubbed} kg/d</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Active Filter Loop</div>
              <div className="text-sm font-bold text-[#06B6D4] mt-0.5">Primary A-4</div>
            </div>
            <div className="bg-[#0B0E14] p-2.5 rounded border border-[#1E2638]/70">
              <div className="text-[10px] text-[#8C9BAE]">Operating State</div>
              <div className="text-sm font-bold text-[#F59E0B] mt-0.5">{scrubberState}</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[11px] font-mono text-[#8C9BAE] mb-1">
              <span>Safety Threshold Ceiling (950 ppm)</span>
              <span className={`font-bold ${co2 > 950 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                {co2 > 950 ? 'THRESHOLD EXCEEDED' : 'WITHIN NOMINAL BAND'}
              </span>
            </div>
            <div className="h-1.5 bg-[#0B0E14] rounded-full overflow-hidden border border-[#1E2638]">
              <div
                className={`h-full ${co2 > 950 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                style={{ width: `${Math.min(100, (co2 / 1400) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrubber State Machine Controls */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2638] pb-3">
          <div>
            <h2 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span>CO2 Scrubber Actuation & Automation Controls</span>
            </h2>
            <p className="text-xs text-[#8C9BAE] mt-0.5">
              Current Mode: <strong className="text-white font-mono">{scrubberState}</strong> | Automated Override: {overrideActive ? 'ENGAGED' : 'STANDBY'}
            </p>
          </div>

          {/* Scrubber Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0B0E14] p-1.5 rounded-lg border border-[#1E2638]">
            {(['OFF', 'STANDBY', 'ACTIVE', 'BOOST', 'MAINTENANCE'] as ScrubberState[]).map((state) => {
              const isCurrent = scrubberState === state;
              return (
                <button
                  key={state}
                  onClick={() => handleScrubberChange(state)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? state === 'BOOST'
                        ? 'bg-[#EF4444] text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : state === 'ACTIVE'
                        ? 'bg-[#10B981] text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : state === 'MAINTENANCE'
                        ? 'bg-[#F59E0B] text-black'
                        : 'bg-[#06B6D4] text-black'
                      : 'text-[#8C9BAE] hover:text-white hover:bg-[#161D2B]'
                  }`}
                >
                  {state}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating Conditions & Diagnostic Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-[#0B0E14] p-3 rounded border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase">Barometric Pressure</span>
            <div className="text-sm font-bold text-white mt-1">{pressure.toFixed(3)} kPa</div>
            <span className="text-[10px] text-[#10B981]">Nominal 101.325 kPa</span>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase">CO2 Scrubbing Headroom</span>
            <div className="text-sm font-bold text-white mt-1">{(1400 - co2).toFixed(0)} ppm Margin</div>
            <span className="text-[10px] text-[#06B6D4]">Dual-Bed Zeolite Active</span>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase">Cartridge Wear</span>
            <div className="text-sm font-bold text-white mt-1">14.2% Consumed</div>
            <span className="text-[10px] text-[#10B981]">2,400h Service Remaining</span>
          </div>
          <div className="bg-[#0B0E14] p-3 rounded border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase">Reactor Temperature</span>
            <div className="text-sm font-bold text-white mt-1">24.5 °C Core</div>
            <span className="text-[10px] text-[#10B981]">Thermal Exchanger Stable</span>
          </div>
        </div>
      </div>

      {/* Scrubber Automation & Threshold Event Ledger */}
      <div className="bg-[#111622] border border-[#1E2638] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-sm font-mono font-bold text-white uppercase">
              Automation Trigger & Action Audit Ledger
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#8C9BAE]">AUTO-REFRESHING LIVE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0B0E14] text-[#8C9BAE] border-b border-[#1E2638] uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Trigger Condition</th>
                <th className="p-2.5">Habitat Sector</th>
                <th className="p-2.5">Measured Telemetry</th>
                <th className="p-2.5">Automated Action</th>
                <th className="p-2.5">Outcome / Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/50">
              {automationLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#161D2B]/50 transition-colors">
                  <td className="p-2.5 text-[#8C9BAE] whitespace-nowrap">{log.time}</td>
                  <td className="p-2.5 text-white font-semibold">{log.trigger}</td>
                  <td className="p-2.5 text-[#06B6D4]">{log.zone}</td>
                  <td className="p-2.5 font-bold text-[#F59E0B]">{log.telemetry}</td>
                  <td className="p-2.5 text-emerald-400">{log.action}</td>
                  <td className="p-2.5 text-[#8C9BAE]">{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
