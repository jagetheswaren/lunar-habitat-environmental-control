import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { LunarDome3D, ModuleData } from '../components/3d/LunarDome3D';
import { ModuleInspectorDrawer } from '../components/intelligence/ModuleInspectorDrawer';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Activity,
  Wind,
  Droplets,
  Thermometer,
  Shield,
  AlertTriangle,
  Radio,
  RefreshCw,
  PlusCircle,
  Clock,
  Cpu,
  Layers,
  CheckCircle2,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [journals, setJournals] = useState<T.JournalEntry[]>([]);
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<
    { id: string; time: string; text: string; type: 'info' | 'warn' | 'crit' }[]
  >([]);

  // Selected module for 3D inspection drawer
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Quick Action Modal: Manual Telemetry Injection
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [postPressure, setPostPressure] = useState<number>(101.3);
  const [postCo2, setPostCo2] = useState<number>(450.0);
  const [postWater, setPostWater] = useState<number>(99.5);
  const [postTemp, setPostTemp] = useState<number>(22.0);
  const [postHumidity, setPostHumidity] = useState<number>(45.0);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Telemetry trend chart active metric
  const [trendMetric, setTrendMetric] = useState<'co2' | 'pressure' | 'water' | 'temp'>('co2');

  const addLog = (text: string, type: 'info' | 'warn' | 'crit' = 'info') => {
    const time = new Date().toISOString().substring(11, 19);
    setSystemLogs(prev => [{ id: Math.random().toString(), time, text, type }, ...prev.slice(0, 15)]);
  };

  const fetchData = async () => {
    try {
      const [tList, aList, jList, zList] = await Promise.all([
        api.telemetry.getAll().catch(() => []),
        api.alerts.getAll().catch(() => []),
        api.journals.getEntries().catch(() => []),
        api.zones.getAll().catch(() => []),
      ]);
      setTelemetry(tList);
      setAlerts(aList);
      setJournals(jList);
      setZones(zList);
      if (zList.length > 0 && !selectedZoneId) {
        setSelectedZoneId(zList[0].id);
      }
    } catch (err) {
      console.error('Failed to load mission control metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect to live SSE Telemetry Stream
    const closeStream = api.v2.connectTelemetryStream(
      () => {
        setSseConnected(true);
        addLog('STREAM LINK ESTABLISHED - TELEMETRY BUS ACTIVE', 'info');
      },
      () => {
        setSseConnected(true);
        fetchData();
        addLog('TELEMETRY PACKET RECEIVED // SENSORS NOMINAL', 'info');
      },
      () => {
        setSseConnected(true);
        fetchData();
        addLog('TELEMETRY STATE SYNCED // BUFFER REFRESHED', 'info');
      },
      () => {
        setSseConnected(false);
        addLog('TELEMETRY STREAM DISCONNECTED // RECONNECTING', 'warn');
      }
    );

    const interval = setInterval(fetchData, 15000);
    return () => {
      clearInterval(interval);
      closeStream();
    };
  }, []);

  const latestTelemetry = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED');

  // LUNAR CORE CALCULATION
  const { coreScore, coreCondition, lastPacketTime } = useMemo(() => {
    if (!latestTelemetry) {
      return {
        coreScore: null,
        coreCondition: 'NO RECENT TELEMETRY',
        lastPacketTime: 'N/A',
      };
    }

    const packetDate = latestTelemetry.recordedAt ? new Date(latestTelemetry.recordedAt) : new Date();
    const ageSeconds = (Date.now() - packetDate.getTime()) / 1000;
    const timeStr = packetDate.toISOString().substring(11, 19) + ' UTC';

    if (ageSeconds > 1800) {
      return {
        coreScore: null,
        coreCondition: 'DATA DEGRADED',
        lastPacketTime: timeStr,
      };
    }

    let score = 100;
    score -= criticalAlerts.length * 20;
    score -= warningAlerts.length * 8;

    const co2 = Number(latestTelemetry.co2LevelPpm || 420);
    if (co2 > 1000) score -= 15;
    else if (co2 > 800) score -= 5;

    const pressure = Number(latestTelemetry.atmosphericPressureKpa || 101.3);
    if (pressure < 98 || pressure > 104) score -= 10;

    const water = Number(latestTelemetry.waterPurityPercent || 99.4);
    if (water < 98) score -= 15;

    score = Math.max(15, Math.min(99, score));

    let condition = 'NOMINAL';
    if (criticalAlerts.length > 0 || score < 75) condition = 'CRITICAL';
    else if (warningAlerts.length > 0 || score < 90) condition = 'WARNING';

    return {
      coreScore: score,
      coreCondition: condition,
      lastPacketTime: timeStr,
    };
  }, [latestTelemetry, criticalAlerts, warningAlerts]);

  // Subsystem health values
  const atmosphereStatus =
    latestTelemetry && (latestTelemetry.atmosphericPressureKpa < 98 || latestTelemetry.atmosphericPressureKpa > 104)
      ? 'WARNING'
      : 'NOMINAL';

  const oxygenStatus =
    latestTelemetry && latestTelemetry.oxygenConsumptionRateLpm && latestTelemetry.oxygenConsumptionRateLpm > 25
      ? 'WARNING'
      : 'NOMINAL';

  const waterStatus =
    latestTelemetry && Number(latestTelemetry.waterPurityPercent) < 98 ? 'WARNING' : 'NOMINAL';

  const thermalStatus =
    latestTelemetry && (latestTelemetry.temperatureCelsius < 18 || latestTelemetry.temperatureCelsius > 26)
      ? 'WARNING'
      : 'NOMINAL';

  const powerStatus = 'NOMINAL';
  const scrubberStatus =
    latestTelemetry && latestTelemetry.co2LevelPpm > 950
      ? 'CRITICAL'
      : latestTelemetry && latestTelemetry.co2LevelPpm > 800
      ? 'ACTIVE'
      : 'STANDBY';

  // Primary active incident
  const activeIncident = criticalAlerts[0] || warningAlerts[0] || null;

  const handleAckAlert = async (id: number) => {
    try {
      await api.alerts.acknowledge(id, 'Acknowledged by Mission Control Operator');
      addLog(`INCIDENT #${id} ACKNOWLEDGED`, 'warn');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPost(true);
    try {
      await api.telemetry.post({
        habitatZoneId: selectedZoneId,
        atmosphericPressureKpa: postPressure,
        co2LevelPpm: postCo2,
        waterPurityPercent: postWater,
        temperatureCelsius: postTemp,
        humidityPercent: postHumidity,
        oxygenConsumptionRateLpm: 14.5,
        waterConsumptionRateLpm: 3.2,
        source: 'CONTROL_DESK_MANUAL',
      });
      setShowPostModal(false);
      addLog(`MANUAL TELEMETRY INJECTED // ZONE ${selectedZoneId}`, 'info');
      fetchData();
    } catch (err: any) {
      alert('Failed to post telemetry: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPost(false);
    }
  };

  // Telemetry chart series
  const chartData = useMemo(() => {
    const list = telemetry.slice(-24);
    if (list.length === 0) return [];
    return list.map((t, idx) => {
      let val = 0;
      if (trendMetric === 'co2') val = Number(t.co2LevelPpm || 420);
      else if (trendMetric === 'pressure') val = Number(t.atmosphericPressureKpa || 101.3);
      else if (trendMetric === 'water') val = Number(t.waterPurityPercent || 99.4);
      else if (trendMetric === 'temp') val = Number(t.temperatureCelsius || 22.0);

      const time = t.recordedAt ? new Date(t.recordedAt).toISOString().substring(11, 16) : `T-${24 - idx}m`;
      return { val, time };
    });
  }, [telemetry, trendMetric]);

  const metricConfigs = {
    co2: {
      name: 'ATMOSPHERIC CARBON DIOXIDE',
      unit: 'ppm',
      warningThreshold: 800,
      criticalThreshold: 1000,
      min: 300,
      max: 1200,
      color: '#06B6D4',
    },
    pressure: {
      name: 'ATMOSPHERIC PRESSURE',
      unit: 'kPa',
      warningThreshold: 98.0,
      criticalThreshold: 95.0,
      min: 90,
      max: 110,
      color: '#10B981',
    },
    water: {
      name: 'POTABLE WATER PURITY',
      unit: '%',
      warningThreshold: 98.0,
      criticalThreshold: 96.0,
      min: 94,
      max: 100,
      color: '#06B6D4',
    },
    temp: {
      name: 'HABITAT TEMPERATURE',
      unit: '°C',
      warningThreshold: 24.5,
      criticalThreshold: 27.0,
      min: 15,
      max: 30,
      color: '#F59E0B',
    },
  };

  const currentCfg = metricConfigs[trendMetric];

  // Financial summary
  let totalDebitSum = 0;
  let totalCreditSum = 0;
  journals.forEach(j => {
    totalDebitSum += Number(j.totalDebit || 0);
    totalCreditSum += Number(j.totalCredit || 0);
  });

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ================================================== */}
      {/* FIRST ROW: LUNAR CORE & HORIZONTAL HEALTH RAIL     */}
      {/* ================================================== */}
      <div className="bg-[#111820] border border-[#283443] rounded p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* LUNAR CORE */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F1F4F6] tracking-widest uppercase">
                LUNAR CORE
              </span>
              {coreScore !== null ? (
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-lg font-bold tabular-nums ${
                      coreScore >= 90
                        ? 'text-[#10B981]'
                        : coreScore >= 75
                        ? 'text-[#F59E0B]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {coreScore}
                  </span>
                  <span className="text-[10px] text-[#657184]">/100</span>
                </div>
              ) : null}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  coreCondition === 'NOMINAL'
                    ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                    : coreCondition === 'WARNING'
                    ? 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                    : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                }`}
              >
                {coreCondition}
              </span>
            </div>
            <p className="text-[10px] text-[#657184] uppercase tracking-wider mt-0.5">
              LAST UPDATE: <span className="text-[#98A3B3]">{lastPacketTime}</span>
            </p>
          </div>
        </div>

        <div className="hidden xl:block h-6 w-[1px] bg-[#283443]" />

        {/* HORIZONTAL HEALTH RAIL */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-[11px] uppercase tracking-wider flex-1">
          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">ATMOSPHERE</span>
            <span
              className={`font-bold ${
                atmosphereStatus === 'NOMINAL' ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {atmosphereStatus}
            </span>
          </div>

          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">OXYGEN</span>
            <span
              className={`font-bold ${
                oxygenStatus === 'NOMINAL' ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {oxygenStatus}
            </span>
          </div>

          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">WATER</span>
            <span
              className={`font-bold ${
                waterStatus === 'NOMINAL' ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {waterStatus}
            </span>
          </div>

          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">THERMAL</span>
            <span
              className={`font-bold ${
                thermalStatus === 'NOMINAL' ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {thermalStatus}
            </span>
          </div>

          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">POWER</span>
            <span
              className={`font-bold ${
                powerStatus === 'NOMINAL' ? 'text-[#10B981]' : 'text-[#F59E0B]'
              }`}
            >
              {powerStatus}
            </span>
          </div>

          <div className="p-1.5 bg-[#0C1118] border border-[#283443] rounded">
            <span className="text-[9px] text-[#657184] block">SCRUBBERS</span>
            <span
              className={`font-bold ${
                scrubberStatus === 'CRITICAL'
                  ? 'text-[#EF4444]'
                  : scrubberStatus === 'ACTIVE'
                  ? 'text-[#06B6D4]'
                  : 'text-[#10B981]'
              }`}
            >
              {scrubberStatus}
            </span>
          </div>
        </div>

        {/* Action button: manual post */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#06B6D4] hover:border-[#06B6D4]/40 font-bold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>POST TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* SECOND AREA: LEFT 68% DIGITAL TWIN / RIGHT 32% OPS */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT 68%: DIGITAL TWIN PREVIEW */}
        <div className="lg:col-span-8 bg-[#111820] border border-[#283443] rounded overflow-hidden flex flex-col h-[520px] relative">
          <div className="p-2.5 bg-[#0C1118] border-b border-[#283443] flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
                OPERATIONAL DIGITAL TWIN
              </span>
              <span className="text-[10px] text-[#657184]">• THREE.JS SCADA</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/digital-twin')}
                className="px-2 py-0.5 rounded bg-[#161F2A] border border-[#283443] text-[#98A3B3] hover:text-[#06B6D4] text-[10px] uppercase font-semibold transition-colors flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                EXPAND SCENE
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-[#080B10]">
            <LunarDome3D
              status={criticalAlerts.length > 0 ? 'CRITICAL' : warningAlerts.length > 0 ? 'WARNING' : 'NORMAL'}
              zoneName="Habitat Dome Alpha"
              co2Level={latestTelemetry?.co2LevelPpm || 428}
              pressure={latestTelemetry?.atmosphericPressureKpa || 101.32}
              waterPurity={latestTelemetry?.waterPurityPercent || 99.4}
              temperature={latestTelemetry?.temperatureCelsius || 22.1}
              humidity={latestTelemetry?.humidityPercent || 46}
              onSelectModule={moduleId => {
                // Mock or find selected module details
                const dummy: ModuleData = {
                  id: moduleId,
                  name:
                    moduleId === 'dome-alpha'
                      ? 'Habitat Dome Alpha'
                      : moduleId === 'dome-beta'
                      ? 'Hydroponics Dome Beta'
                      : moduleId === 'life-support'
                      ? 'Life Support & Reclamation'
                      : moduleId === 'power-plant'
                      ? 'Nuclear Fission & Solar Array'
                      : moduleId === 'airlock'
                      ? 'EVA Airlock & Decon'
                      : 'Resource Processing Facility',
                  code: moduleId.toUpperCase(),
                  sector: 'HABITAT SECTOR',
                  position: [0, 0, 0],
                  pressure: Number(latestTelemetry?.atmosphericPressureKpa || 101.32),
                  oxygen: 'NOMINAL (21.0%)',
                  co2: Number(latestTelemetry?.co2LevelPpm || 428),
                  temperature: Number(latestTelemetry?.temperatureCelsius || 22.1),
                  humidity: Number(latestTelemetry?.humidityPercent || 46),
                  waterPurity: Number(latestTelemetry?.waterPurityPercent || 99.4),
                  lifeSupport: 'ONLINE',
                  scrubber: scrubberStatus,
                  power: 'STABLE',
                  status:
                    criticalAlerts.length > 0 ? 'CRITICAL' : warningAlerts.length > 0 ? 'WARNING' : 'NOMINAL',
                  statusMessage: 'Module synchronized with real telemetry packets.',
                };
                setSelectedModule(dummy);
                setIsInspectorOpen(true);
              }}
            />

            {/* Click to inspect callout */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#0C1118]/85 border border-[#283443] text-[10px] text-[#98A3B3] pointer-events-none">
              SELECT ANY HABITAT STRUCTURE TO OPEN INSPECTOR DRAWER
            </div>
          </div>
        </div>

        {/* RIGHT 32%: OPERATIONAL STACK */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-[520px]">
          {/* 1. ACTIVE INCIDENT */}
          <div className="bg-[#111820] border border-[#283443] rounded p-3 flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
              <span className="text-[11px] font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${
                    activeIncident?.severity === 'CRITICAL'
                      ? 'text-[#EF4444]'
                      : activeIncident
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                  }`}
                />
                ACTIVE INCIDENT
              </span>
              {activeIncident && <StatusBadge status={activeIncident.severity} />}
            </div>

            {activeIncident ? (
              <div className="mt-2 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#F1F4F6] uppercase">
                    {activeIncident.alertType || activeIncident.message || 'CRITICAL ENVIRONMENTAL BREACH'}
                  </h4>
                  <p className="text-[10px] text-[#657184] uppercase mt-0.5">
                    ZONE: <span className="text-[#98A3B3]">{activeIncident.habitatZone?.name || 'DOME ALPHA'}</span> // TIME:{' '}
                    <span className="text-[#98A3B3]">
                      {activeIncident.createdAt ? new Date(activeIncident.createdAt).toISOString().substring(11, 19) : '12:42:18'} UTC
                    </span>
                  </p>
                </div>

                <div className="p-2 bg-[#0C1118] border border-[#283443] rounded flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-[#657184] block">MEASURED SENSOR</span>
                    <span className="font-bold text-[#EF4444] tabular-nums">
                      {activeIncident.measuredValue ? Number(activeIncident.measuredValue).toFixed(1) : '1280.0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#657184] block">SAFETY CEILING</span>
                    <span className="font-bold text-[#98A3B3] tabular-nums">
                      {activeIncident.thresholdValue ? Number(activeIncident.thresholdValue).toFixed(1) : '800.0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#657184] block">SCRUBBER ACTION</span>
                    <span className="font-bold text-[#06B6D4] uppercase">AUTONOMOUS</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {activeIncident.status !== 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleAckAlert(activeIncident.id)}
                      className="flex-1 py-1 rounded bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/40 font-bold uppercase text-[10px] transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('/alerts')}
                    className="flex-1 py-1 rounded bg-[#161F2A] hover:bg-[#1B2531] text-[#F1F4F6] border border-[#283443] font-bold uppercase text-[10px] transition-colors"
                  >
                    INVESTIGATE
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#F1F4F6] uppercase">ALL SYSTEMS NOMINAL</p>
                <p className="text-[10px] text-[#657184] uppercase">NO MONITORED THRESHOLD BREACHES</p>
              </div>
            )}
          </div>

          {/* 2. CURRENT ZONE STATUS */}
          <div className="bg-[#111820] border border-[#283443] rounded p-2.5 flex-1 overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#283443]">
              <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider">
                CURRENT ZONE STATUS
              </span>
              <span className="text-[9px] text-[#657184]">5 SECTORS</span>
            </div>

            <div className="space-y-1 text-[11px]">
              {[
                { name: 'Dome Alpha (Crew)', press: '101.3 kPa', co2: '428 ppm', status: 'NOMINAL' },
                { name: 'Hydroponics Beta', press: '101.2 kPa', co2: '410 ppm', status: 'NOMINAL' },
                { name: 'Life Support Unit', press: '101.4 kPa', co2: '390 ppm', status: 'NOMINAL' },
                { name: 'Resource Processing', press: '100.8 kPa', co2: '480 ppm', status: 'NOMINAL' },
                { name: 'EVA Airlock', press: '101.0 kPa', co2: '415 ppm', status: 'NOMINAL' },
              ].map((z, idx) => (
                <div
                  key={idx}
                  className="p-1.5 bg-[#0C1118] border border-[#283443] rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#F1F4F6] block text-[10px]">{z.name}</span>
                    <span className="text-[9px] text-[#657184]">
                      {z.press} • {z.co2}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#10B981] font-bold">{z.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. REALTIME SYSTEM FEED */}
          <div className="bg-[#111820] border border-[#283443] rounded p-2.5 h-[160px] flex flex-col">
            <div className="flex items-center justify-between pb-1 border-b border-[#283443]">
              <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                REALTIME SYSTEM FEED
              </span>
              <span className="text-[9px] text-[#06B6D4] font-semibold">{sseConnected ? 'STREAM LIVE' : 'SYNCING'}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pt-1.5 text-[10px]">
              {systemLogs.length === 0 ? (
                <p className="text-[#657184] text-center pt-4">WAITING FOR BUS ACTIVITY...</p>
              ) : (
                systemLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-1.5">
                    <span className="text-[#657184] tabular-nums flex-shrink-0">{log.time}</span>
                    <span
                      className={`truncate ${
                        log.type === 'crit'
                          ? 'text-[#EF4444] font-bold'
                          : log.type === 'warn'
                          ? 'text-[#F59E0B]'
                          : 'text-[#98A3B3]'
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* THIRD AREA: FULL-WIDTH TELEMETRY TREND VISUALIZATION */}
      {/* ================================================== */}
      <div className="bg-[#111820] border border-[#283443] rounded p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#283443]">
          <div>
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider block">
              TELEMETRY TREND ANALYSIS // {currentCfg.name}
            </span>
            <p className="text-[10px] text-[#657184] uppercase mt-0.5">
              24-CYCLE BUFFER • SAMPLING: 60S INTERVAL • UNIT: {currentCfg.unit}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['co2', 'pressure', 'water', 'temp'] as const).map(mKey => (
              <button
                key={mKey}
                onClick={() => setTrendMetric(mKey)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${
                  trendMetric === mKey
                    ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                    : 'bg-[#0C1118] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
                }`}
              >
                {mKey.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Technical SVG Chart */}
        <div className="h-44 w-full relative bg-[#0C1118] border border-[#283443] rounded p-3 flex flex-col justify-between">
          {/* Threshold references */}
          <div className="flex items-center justify-between text-[10px] text-[#657184]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#EF4444]">
                <span className="w-2.5 h-[1px] bg-[#EF4444]" />
                CRITICAL CEILING: {currentCfg.criticalThreshold} {currentCfg.unit}
              </span>
              <span className="flex items-center gap-1 text-[#F59E0B]">
                <span className="w-2.5 h-[1px] bg-[#F59E0B]" />
                WARNING CEILING: {currentCfg.warningThreshold} {currentCfg.unit}
              </span>
            </div>
            <span className="text-[#98A3B3]">
              LATEST: <strong className="text-[#F1F4F6]">{chartData[chartData.length - 1]?.val || '—'} {currentCfg.unit}</strong>
            </span>
          </div>

          {/* SVG Trendline */}
          <div className="flex-1 w-full relative my-1">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="#283443" strokeDasharray="2,2" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#283443" strokeDasharray="2,2" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#283443" strokeDasharray="2,2" strokeWidth="0.5" />

              {/* Trend Polyline */}
              {chartData.length > 1 && (
                <polyline
                  fill="none"
                  stroke={currentCfg.color}
                  strokeWidth="1.5"
                  points={chartData
                    .map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const normalized = Math.max(0, Math.min(1, (d.val - currentCfg.min) / (currentCfg.max - currentCfg.min)));
                      const y = 100 - normalized * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Points */}
              {chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 100;
                const normalized = Math.max(0, Math.min(1, (d.val - currentCfg.min) / (currentCfg.max - currentCfg.min)));
                const y = 100 - normalized * 100;
                const isLatest = i === chartData.length - 1;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isLatest ? 2.5 : 1}
                    fill={isLatest ? '#00E5FF' : currentCfg.color}
                  />
                );
              })}
            </svg>
          </div>

          {/* Time axis */}
          <div className="flex justify-between text-[9px] text-[#657184] border-t border-[#283443]/60 pt-1">
            <span>{chartData[0]?.time || 'T-24m'}</span>
            <span>{chartData[Math.floor(chartData.length / 2)]?.time || 'T-12m'}</span>
            <span>{chartData[chartData.length - 1]?.time || 'T-00m (NOW)'}</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* FOURTH AREA: RECENT OPERATOR / SYSTEM ACTIVITY     */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Double-Entry Ledger Equilibrium */}
        <div className="bg-[#111820] border border-[#283443] rounded p-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
              DOUBLE-ENTRY ACCOUNTING EQUILIBRIUM
            </span>
            <button
              onClick={() => onNavigate('/journal-entries')}
              className="text-[10px] text-[#06B6D4] hover:underline uppercase"
            >
              GENERAL LEDGER
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">TOTAL DEBITS</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">
                ₹{totalDebitSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">TOTAL CREDITS</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">
                ₹{totalCreditSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">EQUILIBRIUM</span>
              <span
                className={`text-sm font-bold uppercase ${
                  Math.abs(totalDebitSum - totalCreditSum) < 0.01 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {Math.abs(totalDebitSum - totalCreditSum) < 0.01 ? 'BALANCED' : 'VARIANCE'}
              </span>
            </div>
          </div>
        </div>

        {/* Life Support Resource Reserves */}
        <div className="bg-[#111820] border border-[#283443] rounded p-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#06B6D4]" />
              LIFE SUPPORT RESOURCE RESERVES
            </span>
            <button
              onClick={() => onNavigate('/inventory')}
              className="text-[10px] text-[#06B6D4] hover:underline uppercase"
            >
              VIEW RESERVES
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">O2 BUFFER</span>
              <span className="text-sm font-bold text-[#10B981] tabular-nums">84,200 L</span>
              <span className="text-[9px] text-[#98A3B3] block">92.5% CAPACITY</span>
            </div>
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">POTABLE WATER</span>
              <span className="text-sm font-bold text-[#06B6D4] tabular-nums">42,800 L</span>
              <span className="text-[9px] text-[#98A3B3] block">88.2% CAPACITY</span>
            </div>
            <div className="p-2 bg-[#0C1118] border border-[#283443] rounded">
              <span className="text-[9px] text-[#657184] uppercase block">NITROGEN BUFFER</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">12,400 L</span>
              <span className="text-[9px] text-[#10B981] block">NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Inspector Drawer */}
      <ModuleInspectorDrawer
        module={selectedModule}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onNavigate={onNavigate}
        unresolvedAlertsCount={activeAlerts.length}
      />

      {/* Manual Telemetry Injection Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#111820] border border-[#283443] rounded max-w-md w-full p-4 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
              <span className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider">
                INJECT TELEMETRY RECORD
              </span>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-[#657184] hover:text-[#F1F4F6]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostTelemetry} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#657184] uppercase block mb-1">
                  TARGET HABITAT SECTOR
                </label>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#657184] uppercase block mb-1">PRESSURE (kPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={postPressure}
                    onChange={e => setPostPressure(Number(e.target.value))}
                    className="w-full bg-[#161F2A] border border-[#283443] rounded p-1.5 text-xs text-[#F1F4F6] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#657184] uppercase block mb-1">CO2 (PPM)</label>
                  <input
                    type="number"
                    step="10"
                    value={postCo2}
                    onChange={e => setPostCo2(Number(e.target.value))}
                    className="w-full bg-[#161F2A] border border-[#283443] rounded p-1.5 text-xs text-[#F1F4F6] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#657184] uppercase block mb-1">WATER PURITY (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={postWater}
                    onChange={e => setPostWater(Number(e.target.value))}
                    className="w-full bg-[#161F2A] border border-[#283443] rounded p-1.5 text-xs text-[#F1F4F6] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#657184] uppercase block mb-1">TEMPERATURE (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={postTemp}
                    onChange={e => setPostTemp(Number(e.target.value))}
                    className="w-full bg-[#161F2A] border border-[#283443] rounded p-1.5 text-xs text-[#F1F4F6] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#283443]">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161F2A] text-[#98A3B3] hover:text-[#F1F4F6] uppercase text-[10px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-4 py-1.5 rounded bg-[#06B6D4] text-[#080B10] font-bold uppercase text-[10px] hover:bg-[#06B6D4]/90 disabled:opacity-50"
                >
                  {submittingPost ? 'TRANSMITTING...' : 'DISPATCH RECORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
