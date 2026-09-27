import React, { useState, useEffect } from 'react';
import {
  Wind,
  Droplets,
  Activity,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Layers,
  Cpu,
} from 'lucide-react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';

type ScrubberState = 'OFF' | 'STANDBY' | 'ACTIVE' | 'BOOST' | 'MAINTENANCE';

export const ResourceReclamationPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<T.Telemetry | any>(null);
  const [zones, setZones] = useState<T.HabitatZoneV2[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [scrubberState, setScrubberState] = useState<ScrubberState>('ACTIVE');
  const [automationLogs, setAutomationLogs] = useState<
    Array<{
      time: string;
      trigger: string;
      zone: string;
      telemetry: string;
      action: string;
      result: string;
    }>
  >([
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
      zone: 'Hydroponics Dome Beta',
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
    const activeZone = zones.find(z => z.id === selectedZoneId)?.name || 'Habitat Dome Alpha';
    const newLog = {
      time: new Date().toISOString().substring(11, 19) + ' UTC',
      trigger: 'Operator Manual Override',
      zone: activeZone,
      telemetry: `${telemetry?.co2LevelPpm ? Number(telemetry.co2LevelPpm).toFixed(1) : '740.0'} ppm CO2`,
      action: `Scrubber Mode -> ${newState}`,
      result: `Manual command dispatched to equipment loop (${newState})`,
    };
    setAutomationLogs(prev => [newLog, ...prev.slice(0, 9)]);
    setSuccessMessage(`Scrubber command [${newState}] accepted by ECLSS subsystem.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const co2Val = telemetry?.co2LevelPpm ? Math.round(Number(telemetry.co2LevelPpm)) : 742;
  const o2Val = '21.0';
  const waterPurity = telemetry?.waterPurityPercent ? Number(telemetry.waterPurityPercent).toFixed(1) : '99.4';

  const flowLanes = [
    {
      name: 'OXYGEN PROCESS LANE',
      color: '#06B6D4',
      steps: [
        { title: 'CREW / TENANTS', value: '12 Active Crew', note: '14.5 LPM demand' },
        { title: 'RESOURCE USE', value: 'Metabolic Respiration', note: 'O2 consumption' },
        { title: 'WASTE STREAM', value: 'Depleted Atmosphere', note: '19.8% O2 returned' },
        { title: 'RECLAMATION', value: 'Water Electrolysis (OGS)', note: '18.2 LPM output' },
        { title: 'TREATMENT', value: 'Catalytic Sabatier Loop', note: 'CO2 + 4H2 -> CH4 + 2H2O' },
        { title: 'STORAGE', value: '84,200 L Reserve', note: 'Cryogenic Dewars' },
        { title: 'REDISTRIBUTION', value: 'Atmosphere Ingress', note: '21.0% regulation' },
      ],
    },
    {
      name: 'WATER PROCESS LANE',
      color: '#38BDF8',
      steps: [
        { title: 'CREW / TENANTS', value: '12 Active Crew', note: '3.2 LPM potable use' },
        { title: 'RESOURCE USE', value: 'Hygiene & Respiration', note: 'Condensate capture' },
        { title: 'WASTE STREAM', value: '2.95 LPM Greywater', note: 'Collected in sump' },
        { title: 'RECLAMATION', value: 'Vapor Compression (VCD)', note: '65.2 °C vacuum boil' },
        { title: 'TREATMENT', value: 'UV + Catalytic Oxidation', note: `${waterPurity}% Purity (TDS < 5)` },
        { title: 'STORAGE', value: '42,800 L Potable Tank', note: 'Pressurized reservoir' },
        { title: 'REDISTRIBUTION', value: 'Potable Water Loop', note: 'Domestic + Agri delivery' },
      ],
    },
    {
      name: 'CO2 PROCESS LANE',
      color: '#F59E0B',
      steps: [
        { title: 'CREW / TENANTS', value: '12 Active Crew', note: 'Exhaled CO2' },
        { title: 'RESOURCE USE', value: 'Cabin Exhalation', note: `${co2Val} ppm baseline` },
        { title: 'WASTE STREAM', value: 'Return Air Ducting', note: '420 LPM blower' },
        { title: 'RECLAMATION', value: 'Amine / LiOH Scrubbers', note: `Mode: ${scrubberState}` },
        { title: 'TREATMENT', value: 'Sabatier Reduction', note: 'Methane vent / H2 recycle' },
        { title: 'STORAGE', value: '12,400 L CO2 Buffer', note: 'Intermediate holding' },
        { title: 'REDISTRIBUTION', value: 'Balanced Return Air', note: '< 600 ppm re-injected' },
      ],
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="RESOURCE RECLAMATION & INDUSTRIAL PROCESS FLOW"
        subtitle="ECLSS INDUSTRIAL CLOSED-LOOP RECLAMATION // OXYGEN, WATER & CO2 MULTI-STAGE LANES"
        icon={RefreshCw}
        badge="ECLSS CLOSED-LOOP"
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

      {successMessage && (
        <div className="p-2.5 rounded bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* INDUSTRIAL PROCESS-FLOW COMPOSITION               */}
      {/* ================================================== */}
      <div className="space-y-4">
        {flowLanes.map((lane, lIdx) => (
          <div key={lIdx} className="bg-[#111820] border border-[#283443] rounded p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
              <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.color }} />
                {lane.name}
              </span>
              <span className="text-[10px] text-[#10B981] font-bold">LANE OPERATIONAL (98.2% EFF)</span>
            </div>

            {/* Step sequence */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {lane.steps.map((st, sIdx) => (
                <div key={sIdx} className="relative">
                  <div className="p-2.5 bg-[#0C1118] border border-[#283443] rounded h-full flex flex-col justify-between space-y-1">
                    <div>
                      <span className="text-[9px] text-[#657184] uppercase font-bold block truncate">
                        {st.title}
                      </span>
                      <h4 className="text-[11px] font-bold text-[#F1F4F6] mt-0.5 truncate">{st.value}</h4>
                    </div>
                    <span className="text-[9px] text-[#06B6D4] block truncate font-semibold">
                      {st.note}
                    </span>
                  </div>

                  {sIdx < lane.steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#657184]">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scrubber Override & Automation Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Scrubber Mode Control */}
        <div className="lg:col-span-5 bg-[#111820] border border-[#283443] rounded p-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#06B6D4]" />
              CATALYTIC SCRUBBER OVERRIDE
            </span>
            <StatusBadge status={scrubberState} size="sm" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-[#657184] uppercase block">TARGET HABITAT ZONE</span>
            <select
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(Number(e.target.value))}
              className="w-full bg-[#161F2A] border border-[#283443] rounded p-2 text-xs text-[#F1F4F6] outline-none"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['STANDBY', 'ACTIVE', 'BOOST', 'MAINTENANCE'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleScrubberChange(mode)}
                className={`py-1.5 rounded text-[10px] font-bold uppercase transition-colors border ${
                  scrubberState === mode
                    ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                    : 'bg-[#0C1118] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {overrideActive && (
            <div className="p-2 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] text-[10px] flex items-center justify-between">
              <span>MANUAL OVERRIDE DISPATCHED</span>
              <button
                onClick={() => {
                  setOverrideActive(false);
                  setScrubberState('ACTIVE');
                }}
                className="underline uppercase font-bold"
              >
                RESET AUTO
              </button>
            </div>
          )}
        </div>

        {/* Automation Logs */}
        <div className="lg:col-span-7 bg-[#111820] border border-[#283443] rounded p-3 flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#10B981]" />
              AUTONOMOUS RECLAMATION LOGS
            </span>
            <span className="text-[10px] text-[#657184]">SCADA EVENT BUS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pt-2 text-[11px]">
            {automationLogs.map((log, idx) => (
              <div key={idx} className="p-2 bg-[#0C1118] border border-[#283443] rounded space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#06B6D4] font-bold">{log.trigger}</span>
                  <span className="text-[#657184] tabular-nums">{log.time}</span>
                </div>
                <div className="text-[#F1F4F6] font-semibold">{log.action}</div>
                <div className="text-[10px] text-[#98A3B3] flex justify-between">
                  <span>ZONE: {log.zone}</span>
                  <span className="text-[#10B981]">{log.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
