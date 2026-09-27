import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Radio,
  RefreshCw,
  Sliders,
  Activity,
  Wifi,
  Clock,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const [data, setData] = useState<T.Telemetry[]>([]);
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Controls
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedMetric, setSelectedMetric] = useState<'co2' | 'pressure' | 'water' | 'temp' | 'humidity'>('co2');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('1h');
  const [mode, setMode] = useState<'LIVE' | 'HISTORICAL'>('LIVE');
  const [sseConnected, setSseConnected] = useState<boolean>(true);

  const fetchTelemetry = async () => {
    try {
      const [records, zoneList] = await Promise.all([
        api.telemetry.getAll().catch(() => []),
        api.zones.getAll().catch(() => []),
      ]);
      setData(records);
      setZones(zoneList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();

    const closeStream = api.v2.connectTelemetryStream(
      () => setSseConnected(true),
      () => {
        setSseConnected(true);
        if (mode === 'LIVE') fetchTelemetry();
      },
      () => {
        setSseConnected(true);
        if (mode === 'LIVE') fetchTelemetry();
      },
      () => setSseConnected(false)
    );

    const interval = setInterval(() => {
      if (mode === 'LIVE') fetchTelemetry();
    }, 15000);

    return () => {
      clearInterval(interval);
      closeStream();
    };
  }, [mode]);

  // Zone filtering
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (selectedZone === 'ALL') return true;
      return (
        item.habitatZone?.code === selectedZone ||
        item.habitatZone?.id?.toString() === selectedZone ||
        (item as any).habitatZoneId?.toString() === selectedZone
      );
    });
  }, [data, selectedZone]);

  // Metric configuration
  const metricConfigs = {
    co2: {
      name: 'ATMOSPHERIC CARBON DIOXIDE',
      unit: 'ppm',
      warningThreshold: 800,
      criticalThreshold: 1000,
      min: 300,
      max: 1300,
      color: '#06B6D4',
      getValue: (t: T.Telemetry) => Number(t.co2LevelPpm || 0),
    },
    pressure: {
      name: 'ATMOSPHERIC PRESSURE',
      unit: 'kPa',
      warningThreshold: 98.0,
      criticalThreshold: 95.0,
      min: 90,
      max: 110,
      color: '#10B981',
      getValue: (t: T.Telemetry) => Number(t.atmosphericPressureKpa || 0),
    },
    water: {
      name: 'POTABLE WATER PURITY',
      unit: '%',
      warningThreshold: 98.0,
      criticalThreshold: 96.0,
      min: 93,
      max: 100,
      color: '#06B6D4',
      getValue: (t: T.Telemetry) => Number(t.waterPurityPercent || 0),
    },
    temp: {
      name: 'HABITAT TEMPERATURE',
      unit: '°C',
      warningThreshold: 24.5,
      criticalThreshold: 27.0,
      min: 15,
      max: 32,
      color: '#F59E0B',
      getValue: (t: T.Telemetry) => Number(t.temperatureCelsius || 0),
    },
    humidity: {
      name: 'RELATIVE HUMIDITY',
      unit: '%',
      warningThreshold: 65.0,
      criticalThreshold: 75.0,
      min: 20,
      max: 85,
      color: '#38BDF8',
      getValue: (t: T.Telemetry) => Number(t.humidityPercent || 0),
    },
  };

  const currentCfg = metricConfigs[selectedMetric];
  const latest = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;

  // Chart data points
  const chartPoints = useMemo(() => {
    const sliceCount = timeRange === '1h' ? 30 : timeRange === '6h' ? 60 : 120;
    const items = filteredData.slice(-sliceCount);
    return items.map((t, idx) => ({
      val: currentCfg.getValue(t),
      time: t.recordedAt ? new Date(t.recordedAt).toISOString().substring(11, 16) : `T-${sliceCount - idx}m`,
      item: t,
    }));
  }, [filteredData, timeRange, currentCfg]);

  const latestVal = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].val : 0;

  // Dense table columns
  const columns: Column<T.Telemetry>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 font-bold text-[#98A3B3]',
    },
    {
      header: 'TIMESTAMP (UTC)',
      render: row => (
        <span className="tabular-nums text-[#F1F4F6]">
          {row.recordedAt ? new Date(row.recordedAt).toISOString().replace('T', ' ').substring(0, 19) : '—'}
        </span>
      ),
    },
    {
      header: 'ZONE',
      render: row => (
        <span className="text-[#06B6D4] font-semibold">
          {row.habitatZone?.name || (row as any).habitatZoneName || 'DOME ALPHA'}
        </span>
      ),
    },
    {
      header: 'PRESSURE (kPA)',
      render: row => (
        <span className="tabular-nums">
          {Number(row.atmosphericPressureKpa).toFixed(2)}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'CO2 (PPM)',
      render: row => {
        const val = Number(row.co2LevelPpm);
        return (
          <span
            className={`font-bold tabular-nums ${
              val > 1000 ? 'text-[#EF4444]' : val > 800 ? 'text-[#F59E0B]' : 'text-[#F1F4F6]'
            }`}
          >
            {Math.round(val)}
          </span>
        );
      },
      align: 'right',
    },
    {
      header: 'WATER PURITY (%)',
      render: row => (
        <span className="tabular-nums text-[#06B6D4]">
          {Number(row.waterPurityPercent).toFixed(1)}%
        </span>
      ),
      align: 'right',
    },
    {
      header: 'TEMP (°C)',
      render: row => (
        <span className="tabular-nums">
          {Number(row.temperatureCelsius).toFixed(1)}°C
        </span>
      ),
      align: 'right',
    },
    {
      header: 'HUMIDITY (%)',
      render: row => (
        <span className="tabular-nums">
          {Number(row.humidityPercent).toFixed(0)}%
        </span>
      ),
      align: 'right',
    },
    {
      header: 'SOURCE',
      render: row => (
        <span className="text-[10px] text-[#657184] uppercase">
          {row.source || 'SENSOR_BUS'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="LIVE TELEMETRY & SENSOR BUS"
        subtitle="SCADA SENSOR SAMPLING // SPECTRAL & ENVIRONMENTAL TELEMETRY STREAM"
        icon={Radio}
        badge="SCADA STREAM"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchTelemetry();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6] uppercase transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        }
      />

      {/* ================================================== */}
      {/* HEADER CONTROLS BAR                                */}
      {/* ================================================== */}
      <div className="p-3 bg-[#111820] border border-[#283443] rounded flex flex-wrap items-center justify-between gap-3 text-[11px]">
        {/* Zone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[#657184] uppercase font-bold">ZONE:</span>
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="bg-[#161F2A] border border-[#283443] rounded px-2.5 py-1 text-xs text-[#F1F4F6] outline-none"
          >
            <option value="ALL">ALL HABITAT SECTORS</option>
            {zones.map(z => (
              <option key={z.id} value={z.code}>
                {z.name} ({z.code})
              </option>
            ))}
          </select>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#657184] uppercase font-bold mr-1">METRIC:</span>
          {(['co2', 'pressure', 'water', 'temp', 'humidity'] as const).map(mKey => (
            <button
              key={mKey}
              onClick={() => setSelectedMetric(mKey)}
              className={`px-2 py-1 rounded uppercase font-bold transition-colors border ${
                selectedMetric === mKey
                  ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                  : 'bg-[#0C1118] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
              }`}
            >
              {mKey}
            </button>
          ))}
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#657184] uppercase font-bold mr-1">RANGE:</span>
          {(['1h', '6h', '24h', 'all'] as const).map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-2 py-0.5 rounded uppercase font-bold transition-colors border ${
                timeRange === tr
                  ? 'bg-[#161F2A] border-[#F1F4F6] text-[#F1F4F6]'
                  : 'bg-[#0C1118] border-[#283443] text-[#657184] hover:text-[#98A3B3]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>

        {/* Live / Historical Toggle */}
        <div className="flex items-center gap-1 bg-[#0C1118] border border-[#283443] rounded p-0.5">
          <button
            onClick={() => setMode('LIVE')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
              mode === 'LIVE' ? 'bg-[#161F2A] text-[#06B6D4]' : 'text-[#657184]'
            }`}
          >
            LIVE
          </button>
          <button
            onClick={() => setMode('HISTORICAL')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
              mode === 'HISTORICAL' ? 'bg-[#161F2A] text-[#F1F4F6]' : 'text-[#657184]'
            }`}
          >
            HISTORICAL
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0C1118] border border-[#283443]">
          <span className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
          <span className="text-[#657184]">CONNECTION:</span>
          <span className={`font-bold ${sseConnected ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {sseConnected ? 'STREAM ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* ================================================== */}
      {/* ONE MAJOR TECHNICAL CHART                          */}
      {/* ================================================== */}
      <div className="p-4 bg-[#111820] border border-[#283443] rounded space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
          <div>
            <h3 className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider">
              {currentCfg.name}
            </h3>
            <p className="text-[10px] text-[#657184] uppercase mt-0.5">
              TELEMETRY BUS TRACE • FREQUENCY: 1 HZ • METRIC SENSITIVITY: HIGH
            </p>
          </div>

          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-[#EF4444]">
              <span className="w-3 h-[2px] bg-[#EF4444]" />
              CRITICAL CEILING: {currentCfg.criticalThreshold} {currentCfg.unit}
            </span>
            <span className="flex items-center gap-1.5 text-[#F59E0B]">
              <span className="w-3 h-[2px] bg-[#F59E0B]" />
              WARNING CEILING: {currentCfg.warningThreshold} {currentCfg.unit}
            </span>
            <span className="px-2 py-1 rounded bg-[#0C1118] border border-[#283443] text-[#F1F4F6] font-bold">
              LATEST: {latestVal.toFixed(1)} {currentCfg.unit}
            </span>
          </div>
        </div>

        {/* Large Technical Chart Canvas / SVG */}
        <div className="h-64 w-full bg-[#0C1118] border border-[#283443] rounded p-4 relative flex flex-col justify-between">
          {/* Warning / Critical Guidelines */}
          <div className="absolute inset-x-4 top-4 bottom-8 pointer-events-none">
            {/* Critical ceiling line */}
            <div
              className="absolute inset-x-0 border-b border-dashed border-[#EF4444]/60 flex items-center justify-end"
              style={{
                top: `${100 - ((currentCfg.criticalThreshold - currentCfg.min) / (currentCfg.max - currentCfg.min)) * 100}%`,
              }}
            >
              <span className="text-[9px] text-[#EF4444] px-1 bg-[#0C1118] -translate-y-2 font-bold">
                CRIT {currentCfg.criticalThreshold}
              </span>
            </div>

            {/* Warning ceiling line */}
            <div
              className="absolute inset-x-0 border-b border-dashed border-[#F59E0B]/60 flex items-center justify-end"
              style={{
                top: `${100 - ((currentCfg.warningThreshold - currentCfg.min) / (currentCfg.max - currentCfg.min)) * 100}%`,
              }}
            >
              <span className="text-[9px] text-[#F59E0B] px-1 bg-[#0C1118] -translate-y-2 font-bold">
                WARN {currentCfg.warningThreshold}
              </span>
            </div>
          </div>

          {/* SVG Polyline */}
          <div className="flex-1 w-full relative z-10">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="#283443" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#283443" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="#283443" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#283443" strokeDasharray="3,3" strokeWidth="0.5" />

              {/* Data curve */}
              {chartPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke={currentCfg.color}
                  strokeWidth="2"
                  points={chartPoints
                    .map((pt, i) => {
                      const x = (i / (chartPoints.length - 1)) * 100;
                      const norm = Math.max(0, Math.min(1, (pt.val - currentCfg.min) / (currentCfg.max - currentCfg.min)));
                      const y = 100 - norm * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              )}

              {/* Points */}
              {chartPoints.map((pt, i) => {
                const x = (i / (chartPoints.length - 1)) * 100;
                const norm = Math.max(0, Math.min(1, (pt.val - currentCfg.min) / (currentCfg.max - currentCfg.min)));
                const y = 100 - norm * 100;
                const isLatest = i === chartPoints.length - 1;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={isLatest ? 3.5 : 1.5}
                    fill={isLatest ? '#00E5FF' : currentCfg.color}
                  />
                );
              })}
            </svg>
          </div>

          {/* Time axis */}
          <div className="flex justify-between text-[9px] text-[#657184] border-t border-[#283443] pt-2 z-10">
            <span>{chartPoints[0]?.time || 'T-START'}</span>
            <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.time || 'MID-BUFFER'}</span>
            <span className="text-[#06B6D4] font-bold">
              {chartPoints[chartPoints.length - 1]?.time || 'LATEST PACKET'} (NOW)
            </span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* COMPACT CURRENT READINGS                           */}
      {/* ================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">PRESSURE</span>
          <span className="text-base font-bold text-[#F1F4F6] tabular-nums">
            {latest ? Number(latest.atmosphericPressureKpa).toFixed(2) : '101.32'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">kPa</span>
        </div>

        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">CO2 CONCENTRATION</span>
          <span
            className={`text-base font-bold tabular-nums ${
              latest && latest.co2LevelPpm > 1000
                ? 'text-[#EF4444]'
                : latest && latest.co2LevelPpm > 800
                ? 'text-[#F59E0B]'
                : 'text-[#F1F4F6]'
            }`}
          >
            {latest ? Math.round(Number(latest.co2LevelPpm)) : '428'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">ppm</span>
        </div>

        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">WATER PURITY</span>
          <span className="text-base font-bold text-[#06B6D4] tabular-nums">
            {latest ? Number(latest.waterPurityPercent).toFixed(1) : '99.4'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">%</span>
        </div>

        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">TEMPERATURE</span>
          <span className="text-base font-bold text-[#F1F4F6] tabular-nums">
            {latest ? Number(latest.temperatureCelsius).toFixed(1) : '22.1'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">°C</span>
        </div>

        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">O2 FLOW RATE</span>
          <span className="text-base font-bold text-[#10B981] tabular-nums">
            {latest?.oxygenConsumptionRateLpm ? Number(latest.oxygenConsumptionRateLpm).toFixed(1) : '14.5'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-2.5 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block">WATER FLOW RATE</span>
          <span className="text-base font-bold text-[#38BDF8] tabular-nums">
            {latest?.waterConsumptionRateLpm ? Number(latest.waterConsumptionRateLpm).toFixed(1) : '3.2'}
          </span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* DENSE TELEMETRY TABLE                              */}
      {/* ================================================== */}
      <DataTable
        columns={columns}
        data={filteredData.slice().reverse()}
        loading={loading}
        emptyMessage="NO TELEMETRY RECORDED IN THE SPECIFIED HABITAT ZONE"
        searchable
        searchPlaceholder="SEARCH TELEMETRY RECORDS (TIMESTAMP, ZONE, SOURCE)..."
        pageSize={25}
      />
    </div>
  );
};
