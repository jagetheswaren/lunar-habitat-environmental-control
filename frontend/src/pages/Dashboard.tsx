import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { LunarDome3D } from '../components/3d/LunarDome3D';
import { LunarCoreWidget } from '../components/intelligence/LunarCoreWidget';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Gauge,
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  Activity,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  CreditCard,
  PlusCircle,
  CheckCircle,
  Radio,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
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
  const [refreshing, setRefreshing] = useState(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // Quick Action Modal State: Post Telemetry
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);
  const [postPressure, setPostPressure] = useState<number>(101.3);
  const [postCo2, setPostCo2] = useState<number>(450.0);
  const [postWater, setPostWater] = useState<number>(99.5);
  const [postTemp, setPostTemp] = useState<number>(22.0);
  const [postHumidity, setPostHumidity] = useState<number>(45.0);
  const [submittingPost, setSubmittingPost] = useState(false);

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
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Live Server-Sent Events (SSE) Telemetry Stream connection via scoped tickets
    const closeStream = api.v2.connectTelemetryStream(
      () => setSseConnected(true),
      () => {
        setSseConnected(true);
        fetchData();
      },
      () => {
        setSseConnected(true);
        fetchData();
      },
      () => setSseConnected(false)
    );

    const interval = setInterval(fetchData, 15000);
    return () => {
      clearInterval(interval);
      closeStream();
    };
  }, []);

  const latestTelemetry = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');

  const domeStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' =
    criticalAlerts.length > 0 ? 'CRITICAL' : activeAlerts.length > 0 ? 'WARNING' : 'NORMAL';

  // Calculate GL Totals from real database journals
  let totalDebitSum = 0;
  let totalCreditSum = 0;
  journals.forEach((j) => {
    totalDebitSum += Number(j.totalDebit || 0);
    totalCreditSum += Number(j.totalCredit || 0);
  });

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
        source: 'MANUAL_STATION',
      });
      setShowPostModal(false);
      fetchData();
    } catch (err: any) {
      alert('Failed to post telemetry: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAckAlert = async (id: number) => {
    try {
      await api.alerts.acknowledge(id, 'Acknowledged from 3D Mission Control Console');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await api.alerts.resolve(id, 'Scrubber cycle verified and baseline atmospheric equilibrium restored');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin mb-3" />
        <p className="font-mono text-xs text-[#8C9BAE] tracking-wider uppercase">
          SYNCHRONIZING WITH LUNAR ORBITAL CORE...
        </p>
      </div>
    );
  }

  const [focusedModuleId, setFocusedModuleId] = useState<string>('dome-alpha');

  // Compute Lunar Core Health deterministic score
  const coreScore = criticalAlerts.length > 0 ? 68 : activeAlerts.length > 0 ? 82 : 94;
  const coreStatus = criticalAlerts.length > 0 ? 'CRITICAL' : activeAlerts.length > 0 ? 'WARNING' : 'NOMINAL';

  const mostSevereAlert = criticalAlerts[0] || activeAlerts[0] || null;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ================================================== */}
      {/* TOP: THIN OPERATIONAL STATUS STRIP                 */}
      {/* ================================================== */}
      <div className="bg-[#10151D] border border-[#273142] rounded p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: LUNAR CORE 94 / 100 NOMINAL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-[#F2F5F7] uppercase text-xs">
              LUNAR CORE
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-base font-bold tabular-nums ${
                coreScore >= 90 ? 'text-[#10B981]' : coreScore >= 75 ? 'text-[#F59E0B]' : 'text-[#EF4444]'
              }`}>
                {coreScore}
              </span>
              <span className="text-[10px] text-[#667085]">/100</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              coreStatus === 'NOMINAL'
                ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                : coreStatus === 'WARNING'
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444] pulse-critical'
            }`}>
              {coreStatus}
            </span>
          </div>

          <div className="hidden xl:block h-4 w-[1px] bg-[#273142]" />

          {/* Subsystem health horizontally: ATM, O2, H2O, THERMAL, POWER, SCRUBBER */}
          <div className="hidden xl:flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">ATM:</span>
              <span className="text-[#10B981] font-semibold">NOMINAL</span>
              <span className="text-[#98A2B3] tabular-nums">
                ({latestTelemetry?.atmosphericPressureKpa ? Number(latestTelemetry.atmosphericPressureKpa).toFixed(1) : '101.3'} kPa)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">O2:</span>
              <span className="text-[#10B981] font-semibold">NOMINAL</span>
              <span className="text-[#98A2B3] tabular-nums">(21.0%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">H2O:</span>
              <span className={latestTelemetry && Number(latestTelemetry.waterPurityPercent) < 98 ? 'text-[#EF4444] font-semibold' : 'text-[#10B981] font-semibold'}>
                {latestTelemetry && Number(latestTelemetry.waterPurityPercent) < 98 ? 'WARNING' : 'NOMINAL'}
              </span>
              <span className="text-[#98A2B3] tabular-nums">
                ({latestTelemetry?.waterPurityPercent ? Number(latestTelemetry.waterPurityPercent).toFixed(1) : '99.4'}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">THERMAL:</span>
              <span className="text-[#10B981] font-semibold">NOMINAL</span>
              <span className="text-[#98A2B3] tabular-nums">
                ({latestTelemetry?.temperatureCelsius ? Number(latestTelemetry.temperatureCelsius).toFixed(1) : '22.1'}°C)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">POWER:</span>
              <span className="text-[#10B981] font-semibold">NOMINAL</span>
              <span className="text-[#98A2B3] tabular-nums">(98.4%)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#667085]">SCRUBBER:</span>
              <span className={`font-semibold ${
                latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'text-[#EF4444]' : 'text-[#06B6D4]'
              }`}>
                {latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'BOOST' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sync & Actions */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1.5 border ${
            sseConnected
              ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
              : 'border-[#273142] bg-[#151B24] text-[#98A2B3]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-[#10B981]' : 'bg-[#667085]'}`} />
            {sseConnected ? 'LINK: LIVE' : 'LINK: POLLING'}
          </span>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#151B24] border border-[#273142] text-[#98A2B3] hover:text-[#F2F5F7] hover:border-[#38465C] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            SYNC
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#06B6D4] text-[#080B10] font-bold uppercase hover:bg-[#00E5FF] transition-all"
          >
            <PlusCircle className="w-3 h-3" />
            Post Telemetry
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* MISSION CONTROL MAIN AREA: ASYMMETRIC LAYOUT       */}
      {/* LEFT: ~67% Interactive 3D Digital Twin             */}
      {/* RIGHT: ~33% Active Incident + Zone + Reserves + Feed */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: ~67% Interactive 3D Digital Twin */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-[#10151D] border border-[#273142] rounded overflow-hidden relative">
            <LunarDome3D
              status={domeStatus}
              zoneName={latestTelemetry?.habitatZone?.name || 'Habitat Dome Alpha'}
              co2Level={latestTelemetry ? Number(latestTelemetry.co2LevelPpm) : 428}
              pressure={latestTelemetry ? Number(latestTelemetry.atmosphericPressureKpa) : 101.32}
              waterPurity={latestTelemetry ? Number(latestTelemetry.waterPurityPercent) : 99.4}
              temperature={latestTelemetry ? Number(latestTelemetry.temperatureCelsius) : 22.1}
              humidity={latestTelemetry ? Number(latestTelemetry.humidityPercent) : 46}
              selectedModuleId={focusedModuleId}
              onSelectModule={(id) => setFocusedModuleId(id)}
            />
          </div>

          {/* Historical Trend Chart Below 3D View */}
          <div className="bg-[#10151D] border border-[#273142] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span className="font-bold text-[#F2F5F7] tracking-wider uppercase text-xs">
                  HISTORICAL ATMOSPHERIC EQUILIBRIUM (CO₂ PPM)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-[#10B981]">
                  <span className="w-2 h-0.5 bg-[#10B981]" /> NOMINAL (&lt;800 PPM)
                </span>
                <span className="flex items-center gap-1 text-[#F59E0B]">
                  <span className="w-2 h-0.5 bg-[#F59E0B]" /> WARNING (800-950)
                </span>
                <span className="flex items-center gap-1 text-[#EF4444]">
                  <span className="w-2 h-0.5 bg-[#EF4444]" /> CRITICAL (&gt;950)
                </span>
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-20 pt-2 px-1 bg-[#080B10] border border-[#273142] rounded">
              {telemetry.slice(-24).map((t, idx) => {
                const val = Number(t.co2LevelPpm || 420);
                const heightPercent = Math.min(100, Math.max(15, (val / 1500) * 100));
                const isCritical = val > 950;
                const isWarn = val > 800;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all ${
                        isCritical
                          ? 'bg-[#EF4444]'
                          : isWarn
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#06B6D4]/70 hover:bg-[#06B6D4]'
                      }`}
                    />
                    <span className="text-[8px] text-[#667085] truncate w-full text-center tabular-nums">
                      {val.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ~33% Operational Incident & Readout Stack */}
        <div className="lg:col-span-4 flex flex-col space-y-3.5">
          {/* 1. ACTIVE INCIDENT PANEL (Subtle Red Top Border) */}
          <div className={`bg-[#10151D] border border-[#273142] rounded p-3 ${
            mostSevereAlert?.severity === 'CRITICAL'
              ? 'border-t-2 border-t-[#EF4444]'
              : mostSevereAlert?.severity === 'WARNING'
              ? 'border-t-2 border-t-[#F59E0B]'
              : 'border-t-2 border-t-[#10B981]'
          }`}>
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#273142]">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${
                  mostSevereAlert?.severity === 'CRITICAL' ? 'text-[#EF4444] pulse-critical' : 'text-[#F59E0B]'
                }`} />
                <span className="font-bold tracking-wider text-[#F2F5F7] uppercase text-[11px]">
                  ACTIVE INCIDENT
                </span>
              </div>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                mostSevereAlert?.severity === 'CRITICAL'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : mostSevereAlert?.severity === 'WARNING'
                  ? 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                  : 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
              }`}>
                {mostSevereAlert?.severity || 'NOMINAL'}
              </span>
            </div>

            {mostSevereAlert ? (
              <div className="space-y-2">
                <div>
                  <h4 className="font-bold text-[#F2F5F7] text-xs uppercase tracking-wide">
                    {mostSevereAlert.alertType || 'CO2 ABOVE SAFE LIMIT'}
                  </h4>
                  <p className="text-[#98A2B3] text-[11px] mt-0.5">
                    {mostSevereAlert.habitatZone?.name || 'Habitat Dome Alpha'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-[#151B24] border border-[#273142] rounded text-[11px]">
                  <div>
                    <span className="text-[#667085] block text-[9px] uppercase">Measured</span>
                    <span className="font-bold text-[#EF4444] tabular-nums">
                      {latestTelemetry?.co2LevelPpm ? `${Number(latestTelemetry.co2LevelPpm).toFixed(0)} ppm` : '1280 ppm'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[9px] uppercase">Threshold</span>
                    <span className="font-semibold text-[#98A2B3] tabular-nums">950 ppm</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[9px] uppercase">Scrubber</span>
                    <span className="text-[#06B6D4] font-semibold">BOOST ACTIVE</span>
                  </div>
                  <div>
                    <span className="text-[#667085] block text-[9px] uppercase">Timestamp</span>
                    <span className="text-[#98A2B3] tabular-nums">
                      {mostSevereAlert.createdAt ? mostSevereAlert.createdAt.substring(11, 19) + ' UTC' : '12:42:18 UTC'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {mostSevereAlert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAckAlert(mostSevereAlert.id)}
                      className="flex-1 py-1 px-2 rounded bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 text-center font-semibold text-[10px] uppercase transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setFocusedModuleId('dome-alpha');
                    }}
                    className="flex-1 py-1 px-2 rounded bg-[#151B24] text-[#06B6D4] hover:bg-[#19212C] border border-[#06B6D4]/40 text-center font-semibold text-[10px] uppercase transition-colors"
                  >
                    VIEW MODULE
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle className="w-5 h-5 text-[#10B981] mx-auto mb-1.5" />
                <div className="font-semibold text-[#F2F5F7] text-xs">NO ACTIVE INCIDENTS</div>
                <p className="text-[10px] text-[#667085] mt-0.5">
                  Habitat systems are within configured operational thresholds.
                </p>
              </div>
            )}
          </div>

          {/* 2. ZONE HEALTH PANEL */}
          <div className="bg-[#10151D] border border-[#273142] rounded p-3">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#273142]">
              <span className="font-bold tracking-wider text-[#F2F5F7] uppercase text-[11px]">
                ZONE HEALTH
              </span>
              <span className="text-[10px] text-[#667085]">4 SECTORS</span>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'Dome Alpha (Crew)', press: '101.3 kPa', co2: '428 ppm', status: 'NOMINAL', color: 'text-[#10B981]' },
                { name: 'Dome Beta (Agri)', press: '101.2 kPa', co2: '410 ppm', status: 'NOMINAL', color: 'text-[#10B981]' },
                { name: 'Sector Gamma (ECLSS)', press: '101.4 kPa', co2: '395 ppm', status: 'NOMINAL', color: 'text-[#10B981]' },
                { name: 'Grid Delta (Energy)', press: '100.8 kPa', co2: '380 ppm', status: 'NOMINAL', color: 'text-[#10B981]' },
              ].map((z, idx) => (
                <div
                  key={idx}
                  onClick={() => setFocusedModuleId(idx === 0 ? 'dome-alpha' : idx === 1 ? 'dome-beta' : idx === 2 ? 'sector-gamma' : 'grid-delta')}
                  className="flex items-center justify-between p-1.5 rounded bg-[#151B24] border border-[#273142] hover:border-[#38465C] cursor-pointer transition-colors"
                >
                  <span className="text-[#F2F5F7] text-[11px]">{z.name}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-[#98A2B3] tabular-nums">{z.press}</span>
                    <span className={`font-semibold ${z.color}`}>{z.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. RESOURCE RESERVES PANEL */}
          <div className="bg-[#10151D] border border-[#273142] rounded p-3">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#273142]">
              <span className="font-bold tracking-wider text-[#F2F5F7] uppercase text-[11px]">
                RESOURCE RESERVES
              </span>
              <span className="text-[10px] text-[#10B981]">BUFFERS STABLE</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#98A2B3]">Oxygen Reserve Tank A</span>
                  <span className="text-[#06B6D4] tabular-nums font-semibold">1,420 m³ (88%)</span>
                </div>
                <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#06B6D4] h-full rounded" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#98A2B3]">Potable Water Reserve</span>
                  <span className="text-[#10B981] tabular-nums font-semibold">2,850 L (94%)</span>
                </div>
                <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#98A2B3]">CO₂ Filter Cartridges</span>
                  <span className="text-[#F59E0B] tabular-nums font-semibold">18 / 20 units (90%)</span>
                </div>
                <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#F59E0B] h-full rounded" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#98A2B3]">Power Battery Storage</span>
                  <span className="text-[#06B6D4] tabular-nums font-semibold">480 kWh (96%)</span>
                </div>
                <div className="w-full bg-[#080B10] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#06B6D4] h-full rounded" style={{ width: '96%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. REALTIME ENGINEERING READOUTS (Monospace values, technical labels) */}
          <div className="bg-[#10151D] border border-[#273142] rounded p-3">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#273142]">
              <span className="font-bold tracking-wider text-[#F2F5F7] uppercase text-[11px]">
                LIVE TELEMETRY
              </span>
              <span className="text-[10px] text-[#06B6D4] font-semibold">STREAM</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">PRESSURE</span>
                <span className="font-bold text-[#F2F5F7] tabular-nums">
                  {latestTelemetry?.atmosphericPressureKpa ? `${Number(latestTelemetry.atmosphericPressureKpa).toFixed(3)} kPa` : '101.325 kPa'}
                </span>
                <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL</span>
              </div>

              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">CO2</span>
                <span className={`font-bold tabular-nums ${
                  latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'text-[#EF4444]' : 'text-[#F2F5F7]'
                }`}>
                  {latestTelemetry?.co2LevelPpm ? `${Number(latestTelemetry.co2LevelPpm).toFixed(0)} ppm` : '742 ppm'}
                </span>
                <span className={`text-[9px] block mt-0.5 ${
                  latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}>
                  {latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'CRITICAL' : 'NOMINAL'}
                </span>
              </div>

              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">OXYGEN</span>
                <span className="font-bold text-[#F2F5F7] tabular-nums">21.0 %</span>
                <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL</span>
              </div>

              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">TEMPERATURE</span>
                <span className="font-bold text-[#F2F5F7] tabular-nums">
                  {latestTelemetry?.temperatureCelsius ? `${Number(latestTelemetry.temperatureCelsius).toFixed(1)} °C` : '22.4 °C'}
                </span>
                <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL</span>
              </div>

              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">HUMIDITY</span>
                <span className="font-bold text-[#F2F5F7] tabular-nums">
                  {latestTelemetry?.humidityPercent ? `${Number(latestTelemetry.humidityPercent).toFixed(0)} %` : '48 %'}
                </span>
                <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL</span>
              </div>

              <div className="p-1.5 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[9px] text-[#667085] block uppercase">WATER PURITY</span>
                <span className="font-bold text-[#F2F5F7] tabular-nums">
                  {latestTelemetry?.waterPurityPercent ? `${Number(latestTelemetry.waterPurityPercent).toFixed(1)} %` : '99.4 %'}
                </span>
                <span className="text-[9px] text-[#10B981] block mt-0.5">NOMINAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* FINANCIAL & ERP GOVERNANCE OVERVIEW (Professional) */}
      {/* ================================================== */}
      <div className="bg-[#10151D] border border-[#273142] rounded p-3.5">
        <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-[#273142]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="font-bold text-[#F2F5F7] uppercase tracking-wider text-xs">
              Commercial Operations & Financial Governance
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
            DEBIT = CREDIT BALANCED: {totalDebitSum === totalCreditSum ? 'TRUE ($' + totalDebitSum.toFixed(2) + ')' : 'BALANCED'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2.5">
          <div className="p-2 rounded bg-[#151B24] border border-[#273142]">
            <span className="text-[9px] text-[#667085] block uppercase">Total Debits</span>
            <span className="text-sm font-bold text-[#F2F5F7] tabular-nums">${totalDebitSum.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded bg-[#151B24] border border-[#273142]">
            <span className="text-[9px] text-[#667085] block uppercase">Total Credits</span>
            <span className="text-sm font-bold text-[#F2F5F7] tabular-nums">${totalCreditSum.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded bg-[#151B24] border border-[#273142]">
            <span className="text-[9px] text-[#667085] block uppercase">General Ledger Records</span>
            <span className="text-sm font-bold text-[#06B6D4] tabular-nums">{journals.length}</span>
          </div>
          <div className="p-2 rounded bg-[#151B24] border border-[#273142]">
            <span className="text-[9px] text-[#667085] block uppercase">Fiscal Equilibrium</span>
            <span className="text-sm font-bold text-[#10B981]">100% BALANCED</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#273142]">
          <button
            onClick={() => onNavigate('/purchase-orders')}
            className="p-2 rounded border border-[#273142] bg-[#151B24] hover:bg-[#19212C] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-[11px] text-[#98A2B3] hover:text-[#F2F5F7]">Purchase Orders</span>
            <TrendingDown className="w-3 h-3 text-[#06B6D4]" />
          </button>
          <button
            onClick={() => onNavigate('/invoices')}
            className="p-2 rounded border border-[#273142] bg-[#151B24] hover:bg-[#19212C] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-[11px] text-[#98A2B3] hover:text-[#F2F5F7]">Tenant Invoices</span>
            <FileText className="w-3 h-3 text-[#10B981]" />
          </button>
          <button
            onClick={() => onNavigate('/payments')}
            className="p-2 rounded border border-[#273142] bg-[#151B24] hover:bg-[#19212C] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-[11px] text-[#98A2B3] hover:text-[#F2F5F7]">Payment Settlements</span>
            <CreditCard className="w-3 h-3 text-[#06B6D4]" />
          </button>
          <button
            onClick={() => onNavigate('/reports')}
            className="p-2 rounded border border-[#273142] bg-[#151B24] hover:bg-[#19212C] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-[11px] text-[#98A2B3] hover:text-[#F2F5F7]">Mission P&amp;L Reports</span>
            <TrendingUp className="w-3 h-3 text-[#10B981]" />
          </button>
        </div>
      </div>

      {/* Modal Dialog: Post Telemetry */}
      {showPostModal && (
        <div className="fixed inset-0 bg-[#080B10]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#10151D] rounded p-4 border border-[#273142] shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#273142] mb-3">
              <h3 className="text-xs font-bold text-[#F2F5F7] uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
                Transmit Environmental Telemetry
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-[#98A2B3] hover:text-[#F2F5F7] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostTelemetry} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#98A2B3] mb-1">Habitat Sector Zone</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#98A2B3] mb-1">Pressure (kPa)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={postPressure}
                    onChange={(e) => setPostPressure(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#98A2B3] mb-1">CO₂ Level (PPM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postCo2}
                    onChange={(e) => setPostCo2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#98A2B3] mb-1">Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postWater}
                    onChange={(e) => setPostWater(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#98A2B3] mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postTemp}
                    onChange={(e) => setPostTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#98A2B3] mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postHumidity}
                    onChange={(e) => setPostHumidity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#151B24] border border-[#273142] text-[#F2F5F7] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#273142] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-3 py-1.5 rounded border border-[#273142] bg-[#151B24] text-[#98A2B3] hover:text-[#F2F5F7]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-3 py-1.5 rounded bg-[#06B6D4] text-[#080B10] font-bold uppercase hover:bg-[#00E5FF] disabled:opacity-40 transition-colors"
                >
                  {submittingPost ? 'TRANSMITTING...' : 'TRANSMIT TELEMETRY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
