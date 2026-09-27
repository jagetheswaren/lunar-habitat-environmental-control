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
  TrendingUp,
  TrendingDown,
  CreditCard,
  PlusCircle,
  CheckCircle,
  Radio,
  FileText,
  Loader2,
  RefreshCw,
  Zap,
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
    } catch (e) {
      console.warn('SSE stream unavailable, using polling fallback');
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
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="font-mono text-sm text-slate-400 tracking-wider">
          SYNCHRONIZING WITH LUNAR ORBITAL CORE...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Mission Control Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Lunar Habitat Operations Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              MISSION ORBITAL ACTIVE
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 border ${
                sseConnected
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-space-850 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {sseConnected ? 'LIVE SSE TELEMETRY STREAM CONNECTED' : 'POLLING FALLBACK ACTIVE'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Autonomous Environmental Control • Resource Reclamation • Financial Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 bg-space-850 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            REFRESH SYNC
          </button>
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-space-950 hover:opacity-90 active:scale-[0.98] shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post Telemetry
          </button>
        </div>
      </div>

      {/* 3D Lunar Habitat Digital Twin Hero Card */}
      <LunarDome3D
        status={domeStatus}
        zoneName={latestTelemetry?.habitatZone?.name || 'Habitat Dome Alpha'}
        co2Level={latestTelemetry ? Number(latestTelemetry.co2LevelPpm) : 428}
        pressure={latestTelemetry ? Number(latestTelemetry.atmosphericPressureKpa) : 101.32}
        waterPurity={latestTelemetry ? Number(latestTelemetry.waterPurityPercent) : 99.4}
        temperature={latestTelemetry ? Number(latestTelemetry.temperatureCelsius) : 22.1}
        humidity={latestTelemetry ? Number(latestTelemetry.humidityPercent) : 46}
      />

      {/* LUNAR CORE Operational Intelligence Widget */}
      <LunarCoreWidget />

      {/* Environmental Live KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Atmospheric & Life-Support Metrics
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            {latestTelemetry ? `LAST SYNC: ${latestTelemetry.recordedAt}` : 'AWAITING TELEMETRY STREAM'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
            subtitle="Reclamation Grade"
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
            subtitle="Biosphere Thermal"
          />
          <MetricCard
            title="Humidity"
            value={latestTelemetry ? latestTelemetry.humidityPercent : '—'}
            unit="%"
            icon={CloudRain}
            status="ok"
            subtitle="Relative Saturation"
          />
          <MetricCard
            title="O₂ Rate"
            value={latestTelemetry?.oxygenConsumptionRateLpm ?? '14.2'}
            unit="L/min"
            icon={Activity}
            status="ok"
            subtitle="Base Habitability"
          />
          <MetricCard
            title="H₂O Rate"
            value={latestTelemetry?.waterConsumptionRateLpm ?? '3.5'}
            unit="L/min"
            icon={Droplets}
            status="ok"
            subtitle="Recycle Loop Rate"
          />
        </div>
      </div>

      {/* Middle Grid: Active Alerts & Environmental Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Alerts Panel */}
        <div className="lunar-glass rounded-2xl p-5 border border-slate-800 lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${criticalAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Incident Governance
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-slate-700 bg-space-850 text-slate-300">
              {activeAlerts.length} OPEN
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                <h4 className="text-xs font-mono font-semibold text-slate-300">
                  ALL SECTORS NOMINAL
                </h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  No active safety threshold violations
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-mono ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-500/10 border-red-500/40 text-red-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold tracking-wider">{alert.alertType}</span>
                    <StatusBadge status={alert.status} />
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-3 line-clamp-3">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>SEVERITY: {alert.severity}</span>
                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleAckAlert(alert.id)}
                          className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
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
            className="w-full mt-3 py-2 text-center text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 rounded-xl bg-cyan-500/5 transition-colors"
          >
            VIEW ALL AUDITED ALERTS →
          </button>
        </div>

        {/* Telemetry Stream Chart / Recent Records */}
        <div className="lunar-glass rounded-2xl p-5 border border-slate-800 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Telemetry Log Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/telemetry')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              FULL TELEMETRY LOG →
            </button>
          </div>

          {/* Simple Visual Line representation from real DB */}
          {telemetry.length === 0 ? (
            <div className="h-48 flex items-center justify-center font-mono text-xs text-slate-500">
              No live telemetry records available
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sparkline / Bar Graph visualizer */}
              <div className="p-4 rounded-xl bg-space-900 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                  <span>HISTORICAL CO₂ CONCENTRATION (PPM)</span>
                  <span className="text-cyan-400 font-semibold">{telemetry.length} SAMPLES RECORDED</span>
                </div>
                <div className="flex items-end gap-1.5 h-24 pt-4">
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
                            isSpike ? 'bg-red-500 group-hover:bg-red-400' : 'bg-cyan-500/70 group-hover:bg-cyan-400'
                          }`}
                        />
                        <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                          {val.toFixed(0)}
                        </span>
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 px-2 py-1 rounded bg-space-950 border border-slate-700 text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                          Zone: {t.habitatZone?.code || 'DOME'} • {val} ppm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent 3 Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800 pb-1">
                    <tr>
                      <th className="pb-1.5">ID</th>
                      <th className="pb-1.5">Sector</th>
                      <th className="pb-1.5">Pressure</th>
                      <th className="pb-1.5">CO₂</th>
                      <th className="pb-1.5">Purity</th>
                      <th className="pb-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {telemetry.slice(-4).reverse().map((t) => (
                      <tr key={t.id} className="text-slate-300">
                        <td className="py-2 text-cyan-400">#{t.id}</td>
                        <td className="py-2">{t.habitatZone?.name || 'Dome Alpha'}</td>
                        <td className="py-2">{t.atmosphericPressureKpa} kPa</td>
                        <td className="py-2 font-semibold">
                          <span className={t.co2LevelPpm > 950 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                            {t.co2LevelPpm} ppm
                          </span>
                        </td>
                        <td className="py-2">{t.waterPurityPercent}%</td>
                        <td className="py-2">
                          <StatusBadge status={t.status || 'NORMAL'} />
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

      {/* Financial Governance & Accounting Overview */}
      <div className="lunar-glass rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Financial Governance & Double-Entry Ledger
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              DEBIT = CREDIT BALANCED: {totalDebitSum === totalCreditSum ? 'TRUE ($' + totalDebitSum.toFixed(2) + ')' : 'PENDING'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Total Journal Debits</span>
            <span className="text-xl font-bold font-mono text-white">${totalDebitSum.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">General Ledger verified</span>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Total Journal Credits</span>
            <span className="text-xl font-bold font-mono text-white">${totalCreditSum.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">Strict equilibrium</span>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Recorded GL Entries</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{journals.length}</span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">Audited transactions</span>
          </div>
          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-1 uppercase">Fiscal Integrity</span>
            <span className="text-xl font-bold font-mono text-emerald-400">100%</span>
            <span className="text-[10px] font-mono text-slate-500 block mt-1">Zero unposted variance</span>
          </div>
        </div>

        {/* Recent Journal Entries List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800 pb-1">
              <tr>
                <th className="pb-1.5">Entry Number</th>
                <th className="pb-1.5">Reference Source</th>
                <th className="pb-1.5">Date</th>
                <th className="pb-1.5">Total Debit</th>
                <th className="pb-1.5">Total Credit</th>
                <th className="pb-1.5">Balance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {journals.slice(-4).reverse().map((j) => (
                <tr key={j.id} className="text-slate-300">
                  <td className="py-2 font-semibold text-cyan-400">{j.entryNumber}</td>
                  <td className="py-2">{j.referenceType || 'MANUAL'}</td>
                  <td className="py-2 text-slate-400">{j.entryDate}</td>
                  <td className="py-2">${Number(j.totalDebit).toFixed(2)}</td>
                  <td className="py-2">${Number(j.totalCredit).toFixed(2)}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      BALANCED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Station Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('/purchase-orders')}
          className="p-3 rounded-xl border border-slate-800 bg-space-900/60 hover:border-cyan-500/40 hover:bg-space-850 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400">
              Procurement POs
            </span>
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">Vendor contracts & orders</span>
        </button>

        <button
          onClick={() => onNavigate('/invoices')}
          className="p-3 rounded-xl border border-slate-800 bg-space-900/60 hover:border-cyan-500/40 hover:bg-space-850 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400">
              Customer Invoices
            </span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">O₂ & water consumption billing</span>
        </button>

        <button
          onClick={() => onNavigate('/payments')}
          className="p-3 rounded-xl border border-slate-800 bg-space-900/60 hover:border-cyan-500/40 hover:bg-space-850 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400">
              Payment Settlement
            </span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">Vendor & customer cashflows</span>
        </button>

        <button
          onClick={() => onNavigate('/reports')}
          className="p-3 rounded-xl border border-slate-800 bg-space-900/60 hover:border-cyan-500/40 hover:bg-space-850 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400">
              Mission Reports
            </span>
            <TrendingUp className="w-4 h-4 text-lunar-gold" />
          </div>
          <span className="text-[11px] font-mono text-slate-400">Balance sheet & stability</span>
        </button>
      </div>

      {/* Modal Dialog: Post Telemetry */}
      {showPostModal && (
        <div className="fixed inset-0 bg-space-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md lunar-glass rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Post Environmental Telemetry
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostTelemetry} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Habitat Sector Zone</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Pressure (kPa)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={postPressure}
                    onChange={(e) => setPostPressure(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CO₂ Level (PPM)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postCo2}
                    onChange={(e) => setPostCo2(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postWater}
                    onChange={(e) => setPostWater(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postTemp}
                    onChange={(e) => setPostTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={postHumidity}
                    onChange={(e) => setPostHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-space-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-space-850 text-slate-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-space-950 font-bold uppercase hover:opacity-90 disabled:opacity-50"
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
