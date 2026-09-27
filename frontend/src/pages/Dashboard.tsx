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

    // Live Server-Sent Events (SSE) Telemetry Stream connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(api.v2.getStreamUrl());

      eventSource.addEventListener('CONNECTED', () => {
        setSseConnected(true);
      });

      eventSource.addEventListener('TELEMETRY', () => {
        setSseConnected(true);
        fetchData();
      });

      eventSource.addEventListener('ALERT', () => {
        setSseConnected(true);
        fetchData();
      });

      eventSource.addEventListener('HEARTBEAT', () => {
        setSseConnected(true);
      });

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      // Fallback
    }

    const interval = setInterval(fetchData, 15000);
    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
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

  return (
    <div className="space-y-4">
      {/* Phase 15: Operational Header & Habitat Safety State Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1E2638]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-[#F0F4F8] font-mono uppercase">
              Mission Control Operations Console
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#111622] text-[#06B6D4] border border-[#06B6D4]/30 uppercase">
              ORBITAL STABILIZED
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium flex items-center gap-1.5 border ${
                sseConnected
                  ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                  : 'border-[#1E2638] bg-[#111622] text-[#8C9BAE]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sseConnected ? 'bg-[#10B981]' : 'bg-[#5A677B]'
                }`}
              />
              {sseConnected ? 'SSE TELEMETRY STREAM ACTIVE' : 'POLLING FALLBACK ACTIVE'}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8C9BAE] mt-0.5">
            Realtime Life Support Telemetry • Double-Entry ERP Governance • Spatial Digital Twin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            SYNC
          </button>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-[#06B6D4] text-[#070A0F] hover:bg-[#00E5FF] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Post Telemetry
          </button>
        </div>
      </div>

      {/* Immediate Viewport Safety Status Bar */}
      <div className={`p-3 rounded border font-mono text-xs flex items-center justify-between flex-wrap gap-2 ${
        criticalAlerts.length > 0
          ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
          : activeAlerts.length > 0
          ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]'
          : 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
      }`}>
        <div className="flex items-center gap-2">
          {criticalAlerts.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-[#EF4444] pulse-critical" />
          ) : activeAlerts.length > 0 ? (
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
          )}
          <span className="font-bold uppercase tracking-wide">
            {criticalAlerts.length > 0
              ? `HABITAT ALERT: ${criticalAlerts.length} CRITICAL INCIDENT(S) REQUIRE ATTENTION`
              : activeAlerts.length > 0
              ? `HABITAT NOTICE: ${activeAlerts.length} ELEVATED THRESHOLD WARNING(S)`
              : 'HABITAT SAFETY STATUS: ALL ATMOSPHERIC & RECLAMATION LOOPS NOMINAL'}
          </span>
        </div>
        <div className="text-[11px] text-[#8C9BAE]">
          <span>SECTORS: {zones.length || 4} MONITORED</span>
          <span className="mx-2">•</span>
          <span>LAST UPDATE: {latestTelemetry?.recordedAt || 'REALTIME'}</span>
        </div>
      </div>

      {/* Priority 1 & 2: LUNAR CORE Operational Health Engine */}
      <LunarCoreWidget />

      {/* Priority 3: 3D Lunar Habitat Digital Twin */}
      <LunarDome3D
        status={domeStatus}
        zoneName={latestTelemetry?.habitatZone?.name || 'Habitat Dome Alpha'}
        co2Level={latestTelemetry ? Number(latestTelemetry.co2LevelPpm) : 428}
        pressure={latestTelemetry ? Number(latestTelemetry.atmosphericPressureKpa) : 101.32}
        waterPurity={latestTelemetry ? Number(latestTelemetry.waterPurityPercent) : 99.4}
        temperature={latestTelemetry ? Number(latestTelemetry.temperatureCelsius) : 22.1}
        humidity={latestTelemetry ? Number(latestTelemetry.humidityPercent) : 46}
      />

      {/* Priority 4: Environmental Live Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-semibold tracking-wider text-[#8C9BAE] uppercase flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
            Atmospheric & Life-Support Realtime Telemetry
          </h3>
          <span className="text-[10px] font-mono text-[#5A677B]">
            {latestTelemetry ? `LAST SAMPLE: ${latestTelemetry.recordedAt}` : 'STREAM ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <MetricCard
            title="Pressure"
            value={latestTelemetry ? latestTelemetry.atmosphericPressureKpa : '—'}
            unit="kPa"
            icon={Gauge}
            status={
              !latestTelemetry
                ? 'info'
                : latestTelemetry.atmosphericPressureKpa < 95 || latestTelemetry.atmosphericPressureKpa > 105
                ? 'warning'
                : 'ok'
            }
            subtitle="Target: 101.3 kPa"
          />
          <MetricCard
            title="CO₂ Level"
            value={latestTelemetry ? latestTelemetry.co2LevelPpm : '—'}
            unit="PPM"
            icon={Wind}
            status={
              !latestTelemetry
                ? 'info'
                : latestTelemetry.co2LevelPpm > 1000
                ? 'critical'
                : latestTelemetry.co2LevelPpm > 800
                ? 'warning'
                : 'ok'
            }
            subtitle="Threshold: <950 PPM"
          />
          <MetricCard
            title="Water Purity"
            value={latestTelemetry ? latestTelemetry.waterPurityPercent : '—'}
            unit="%"
            icon={Droplets}
            status={
              !latestTelemetry
                ? 'info'
                : latestTelemetry.waterPurityPercent < 98.0
                ? 'critical'
                : 'ok'
            }
            subtitle="Recycle Grade"
          />
          <MetricCard
            title="Temperature"
            value={latestTelemetry ? latestTelemetry.temperatureCelsius : '—'}
            unit="°C"
            icon={Thermometer}
            status={
              !latestTelemetry
                ? 'info'
                : latestTelemetry.temperatureCelsius < 18 || latestTelemetry.temperatureCelsius > 26
                ? 'warning'
                : 'ok'
            }
            subtitle="Thermal Target"
          />
          <MetricCard
            title="Humidity"
            value={latestTelemetry ? latestTelemetry.humidityPercent : '—'}
            unit="%"
            icon={CloudRain}
            status="ok"
            subtitle="Saturation"
          />
          <MetricCard
            title="O₂ Rate"
            value={latestTelemetry?.oxygenConsumptionRateLpm ?? '14.2'}
            unit="L/min"
            icon={Activity}
            status="ok"
            subtitle="Biosphere"
          />
          <MetricCard
            title="H₂O Rate"
            value={latestTelemetry?.waterConsumptionRateLpm ?? '3.5'}
            unit="L/min"
            icon={Droplets}
            status="ok"
            subtitle="Recycle Loop"
          />
        </div>
      </div>

      {/* Priority 5: Active Incident Governance & Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident Governance Panel */}
        <div className="bg-[#111622] rounded p-4 border border-[#1E2638] lg:col-span-1 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3.5 h-3.5 ${criticalAlerts.length > 0 ? 'text-[#EF4444] pulse-critical' : 'text-[#F59E0B]'}`} />
              <h3 className="text-xs font-bold text-[#F0F4F8] uppercase tracking-wider">
                Incident Governance
              </h3>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#1E2638] bg-[#0B0E14] text-[#8C9BAE]">
              {activeAlerts.length} OPEN
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-72 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-7 h-7 text-[#10B981] mb-1.5" />
                <h4 className="text-xs font-semibold text-[#F0F4F8] uppercase">
                  ALL SECTORS NOMINAL
                </h4>
                <p className="text-[10px] text-[#5A677B] mt-0.5">
                  No active safety threshold violations
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded border text-xs ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                      : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold tracking-wider uppercase text-[10px]">{alert.alertType}</span>
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                  <p className="text-[#F0F4F8] text-[11px] leading-relaxed mb-2 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#8C9BAE] pt-1.5 border-t border-[#1E2638]">
                    <span>SEVERITY: {alert.severity}</span>
                    <div className="flex items-center gap-1.5">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAckAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 transition-colors border border-[#F59E0B]/30 text-[10px]"
                        >
                          ACK
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 transition-colors border border-[#10B981]/30 text-[10px]"
                      >
                        RESOLVE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => onNavigate('/alerts')}
            className="w-full mt-3 py-1.5 text-center text-xs text-[#06B6D4] hover:text-[#00E5FF] border border-[#1E2638] rounded bg-[#0B0E14] transition-colors"
          >
            ALL AUDITED ALERTS →
          </button>
        </div>

        {/* Telemetry Stream Log */}
        <div className="bg-[#111622] rounded p-4 border border-[#1E2638] lg:col-span-2 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
              <h3 className="text-xs font-bold text-[#F0F4F8] uppercase tracking-wider">
                Telemetry Log Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/telemetry')}
              className="text-xs text-[#06B6D4] hover:text-[#00E5FF]"
            >
              FULL TELEMETRY LOG →
            </button>
          </div>

          {telemetry.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[#5A677B]">
              No live telemetry records available
            </div>
          ) : (
            <div className="space-y-3">
              {/* Visualized Sparkline Bars */}
              <div className="p-3 rounded bg-[#0B0E14] border border-[#1E2638]">
                <div className="text-[10px] text-[#8C9BAE] mb-2 flex items-center justify-between">
                  <span>HISTORICAL CO₂ READOUTS (PPM)</span>
                  <span className="text-[#06B6D4] font-semibold">{telemetry.length} SAMPLES</span>
                </div>
                <div className="flex items-end gap-1 h-20 pt-2">
                  {telemetry.slice(-15).map((t, idx) => {
                    const val = Number(t.co2LevelPpm || 400);
                    const heightPercent = Math.min(100, Math.max(15, (val / 1500) * 100));
                    const isSpike = val > 950;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 group relative"
                      >
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            isSpike ? 'bg-[#EF4444]' : 'bg-[#06B6D4]/70 hover:bg-[#06B6D4]'
                          }`}
                        />
                        <span className="text-[8px] text-[#5A677B] truncate w-full text-center tabular-nums">
                          {val.toFixed(0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Telemetry Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-[#8C9BAE] border-b border-[#1E2638] pb-1">
                    <tr>
                      <th className="pb-1">ID</th>
                      <th className="pb-1">Sector</th>
                      <th className="pb-1">Pressure</th>
                      <th className="pb-1">CO₂</th>
                      <th className="pb-1">Purity</th>
                      <th className="pb-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2638]/50">
                    {telemetry.slice(-4).reverse().map((t) => (
                      <tr key={t.id} className="text-[#F0F4F8]">
                        <td className="py-1.5 text-[#06B6D4]">#{t.id}</td>
                        <td className="py-1.5">{t.habitatZone?.name || 'Dome Alpha'}</td>
                        <td className="py-1.5 tabular-nums">{t.atmosphericPressureKpa} kPa</td>
                        <td className="py-1.5 tabular-nums font-semibold">
                          <span className={t.co2LevelPpm > 950 ? 'text-[#EF4444]' : 'text-[#F0F4F8]'}>
                            {t.co2LevelPpm} ppm
                          </span>
                        </td>
                        <td className="py-1.5 tabular-nums">{t.waterPurityPercent}%</td>
                        <td className="py-1.5">
                          <StatusBadge status={t.status || 'NORMAL'} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase 15: Financial Governance & Double-Entry Ledger (Available but non-dominant) */}
      <div className="bg-[#111622] rounded p-4 border border-[#1E2638] font-mono text-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2638]">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
            <h3 className="text-xs font-bold text-[#F0F4F8] uppercase tracking-wider">
              Financial Governance & Double-Entry Ledger
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
            DEBIT = CREDIT BALANCED: {totalDebitSum === totalCreditSum ? 'TRUE ($' + totalDebitSum.toFixed(2) + ')' : 'PENDING'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="p-2.5 rounded bg-[#0B0E14] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] block uppercase">Total Debits</span>
            <span className="text-base font-bold text-[#F0F4F8] tabular-nums">${totalDebitSum.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded bg-[#0B0E14] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] block uppercase">Total Credits</span>
            <span className="text-base font-bold text-[#F0F4F8] tabular-nums">${totalCreditSum.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded bg-[#0B0E14] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] block uppercase">GL Entries</span>
            <span className="text-base font-bold text-[#06B6D4] tabular-nums">{journals.length}</span>
          </div>
          <div className="p-2.5 rounded bg-[#0B0E14] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] block uppercase">Fiscal Equilibrium</span>
            <span className="text-base font-bold text-[#10B981]">100%</span>
          </div>
        </div>

        {/* Quick Navigation Toolbar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#1E2638]">
          <button
            onClick={() => onNavigate('/purchase-orders')}
            className="p-2 rounded border border-[#1E2638] bg-[#0B0E14] hover:bg-[#161D2B] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-[#8C9BAE] hover:text-[#F0F4F8]">Procurement POs</span>
            <TrendingDown className="w-3.5 h-3.5 text-[#06B6D4]" />
          </button>
          <button
            onClick={() => onNavigate('/invoices')}
            className="p-2 rounded border border-[#1E2638] bg-[#0B0E14] hover:bg-[#161D2B] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-[#8C9BAE] hover:text-[#F0F4F8]">Customer Invoices</span>
            <FileText className="w-3.5 h-3.5 text-[#10B981]" />
          </button>
          <button
            onClick={() => onNavigate('/payments')}
            className="p-2 rounded border border-[#1E2638] bg-[#0B0E14] hover:bg-[#161D2B] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-[#8C9BAE] hover:text-[#F0F4F8]">Payments</span>
            <CreditCard className="w-3.5 h-3.5 text-[#06B6D4]" />
          </button>
          <button
            onClick={() => onNavigate('/reports')}
            className="p-2 rounded border border-[#1E2638] bg-[#0B0E14] hover:bg-[#161D2B] text-left transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-[#8C9BAE] hover:text-[#F0F4F8]">Mission Reports</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
          </button>
        </div>
      </div>

      {/* Modal Dialog: Post Telemetry */}
      {showPostModal && (
        <div className="fixed inset-0 bg-[#070A0F]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111622] rounded p-5 border border-[#1E2638] shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2638] mb-3.5">
              <h3 className="text-xs font-bold text-[#F0F4F8] uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
                Transmit Environmental Telemetry
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-[#8C9BAE] hover:text-[#F0F4F8] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostTelemetry} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8C9BAE] mb-1">Habitat Sector Zone</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
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
                  <label className="block text-[#8C9BAE] mb-1">Pressure (kPa)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={postPressure}
                    onChange={(e) => setPostPressure(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#8C9BAE] mb-1">CO₂ Level (PPM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postCo2}
                    onChange={(e) => setPostCo2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#8C9BAE] mb-1">Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postWater}
                    onChange={(e) => setPostWater(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#8C9BAE] mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postTemp}
                    onChange={(e) => setPostTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <div>
                  <label className="block text-[#8C9BAE] mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postHumidity}
                    onChange={(e) => setPostHumidity(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#1E2638] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-3 py-1.5 rounded border border-[#1E2638] bg-[#0B0E14] text-[#8C9BAE] hover:text-[#F0F4F8]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-3 py-1.5 rounded bg-[#06B6D4] text-[#070A0F] font-bold uppercase hover:bg-[#00E5FF] disabled:opacity-40 transition-colors"
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
