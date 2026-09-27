import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Radio, RefreshCw, Filter, Activity, Wifi } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const [data, setData] = useState<T.Telemetry[]>([]);
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedMetric, setSelectedMetric] = useState<'co2' | 'pressure' | 'water' | 'temp' | 'humidity'>('co2');
  const [sampleLimit, setSampleLimit] = useState<number>(30);
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

    // SSE connection check via scoped tickets
    const closeStream = api.v2.connectTelemetryStream(
      () => setSseConnected(true),
      () => {
        setSseConnected(true);
        fetchTelemetry();
      },
      () => {
        setSseConnected(true);
        fetchTelemetry();
      },
      () => setSseConnected(false)
    );

    const interval = setInterval(fetchTelemetry, 15000);
    return () => {
      clearInterval(interval);
      closeStream();
    };
  }, []);

  // Filter by zone
  const filteredData = data.filter((item) => {
    if (selectedZone === 'ALL') return true;
    return item.habitatZone?.code === selectedZone || item.habitatZone?.id?.toString() === selectedZone;
  });

  const displaySamples = filteredData.slice(-sampleLimit);
  const latest = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;

  // Metric metadata
  const metricMeta = {
    co2: {
      name: 'CO₂ Concentration',
      unit: 'PPM',
      threshold: 950,
      thresholdLabel: 'Critical Ceiling: 950 PPM',
      getValue: (t: T.Telemetry) => Number(t.co2LevelPpm || 0),
      isAbnormal: (val: number) => val > 950,
      isWarning: (val: number) => val > 800,
    },
    pressure: {
      name: 'Atmospheric Pressure',
      unit: 'kPa',
      threshold: 101.3,
      thresholdLabel: 'Baseline Target: 101.3 kPa',
      getValue: (t: T.Telemetry) => Number(t.atmosphericPressureKpa || 0),
      isAbnormal: (val: number) => val < 95 || val > 105,
      isWarning: (val: number) => val < 98 || val > 103,
    },
    water: {
      name: 'Reclamation Purity',
      unit: '%',
      threshold: 98.0,
      thresholdLabel: 'Minimum Potable: 98.0%',
      getValue: (t: T.Telemetry) => Number(t.waterPurityPercent || 0),
      isAbnormal: (val: number) => val < 98.0,
      isWarning: (val: number) => val < 99.0,
    },
    temp: {
      name: 'Thermal Equilibrium',
      unit: '°C',
      threshold: 22.0,
      thresholdLabel: 'Nominal Range: 18.0 - 26.0 °C',
      getValue: (t: T.Telemetry) => Number(t.temperatureCelsius || 0),
      isAbnormal: (val: number) => val < 18 || val > 26,
      isWarning: (val: number) => val < 20 || val > 24,
    },
    humidity: {
      name: 'Relative Saturation',
      unit: '%',
      threshold: 45.0,
      thresholdLabel: 'Optimal Biosphere: 40 - 60%',
      getValue: (t: T.Telemetry) => Number(t.humidityPercent || 0),
      isAbnormal: (val: number) => val < 30 || val > 75,
      isWarning: (val: number) => val < 38 || val > 65,
    },
  }[selectedMetric];

  const columns: Column<T.Telemetry>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-[#06B6D4] font-bold',
      render: (r) => `#${r.id}`,
    },
    {
      header: 'Sector Zone',
      render: (r) => (
        <div>
          <div className="font-semibold text-[#F0F4F8]">{r.habitatZone?.name || 'Habitat Sector'}</div>
          <div className="text-[10px] text-[#5A677B]">{r.habitatZone?.code || 'ZONE-ALPHA'}</div>
        </div>
      ),
    },
    {
      header: 'Pressure',
      render: (r) => (
        <span className="tabular-nums font-mono text-[#F0F4F8]">
          {Number(r.atmosphericPressureKpa).toFixed(2)} kPa
        </span>
      ),
    },
    {
      header: 'CO₂ Level',
      render: (r) => {
        const val = Number(r.co2LevelPpm);
        return (
          <span className={`tabular-nums font-mono font-semibold ${val > 950 ? 'text-[#EF4444]' : val > 800 ? 'text-[#F59E0B]' : 'text-[#F0F4F8]'}`}>
            {val.toFixed(1)} PPM
          </span>
        );
      },
    },
    {
      header: 'Water Purity',
      render: (r) => (
        <span className="tabular-nums font-mono text-[#10B981]">
          {Number(r.waterPurityPercent).toFixed(1)}%
        </span>
      ),
    },
    {
      header: 'Temperature',
      render: (r) => (
        <span className="tabular-nums font-mono text-[#F0F4F8]">
          {Number(r.temperatureCelsius).toFixed(1)} °C
        </span>
      ),
    },
    {
      header: 'Humidity',
      render: (r) => (
        <span className="tabular-nums font-mono text-[#8C9BAE]">
          {Number(r.humidityPercent).toFixed(1)}%
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'NORMAL'} size="sm" />,
    },
    {
      header: 'Source Node',
      render: (r) => <span className="text-[10px] text-[#8C9BAE]">{r.source || 'SENSOR_BUS'}</span>,
    },
    {
      header: 'Timestamp (UTC)',
      accessorKey: 'recordedAt',
      className: 'text-[#5A677B] text-[11px] tabular-nums',
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Environmental Telemetry Stream"
        subtitle="Multi-spectral atmospheric, hydrological, and thermal sensor matrices"
        icon={Radio}
        badge="REALTIME BUS"
        actions={
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1.5 border ${
                sseConnected
                  ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                  : 'border-[#1E2638] bg-[#111622] text-[#8C9BAE]'
              }`}
            >
              <Wifi className="w-3 h-3 text-[#10B981]" />
              {sseConnected ? 'SSE ACTIVE' : 'POLLING'}
            </span>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchTelemetry();
              }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
              SYNC
            </button>
          </div>
        }
      />

      {/* Control Bar: Zone Selector, Metric Selector, Sample Range */}
      <div className="bg-[#111622] p-3 rounded border border-[#1E2638] font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#8C9BAE]">
            <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="uppercase text-[10px] font-bold">Sector:</span>
          </div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-[#0B0E14] border border-[#1E2638] rounded px-2.5 py-1 text-xs text-[#F0F4F8] focus:outline-none focus:border-[#06B6D4]"
          >
            <option value="ALL">ALL HABITAT SECTORS ({data.length} records)</option>
            {zones.map((z) => (
              <option key={z.id} value={z.code}>
                {z.name} ({z.code})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-[#8C9BAE] ml-2">
            <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="uppercase text-[10px] font-bold">Metric:</span>
          </div>
          <div className="flex items-center rounded border border-[#1E2638] bg-[#0B0E14] p-0.5">
            {[
              { id: 'co2', label: 'CO₂' },
              { id: 'pressure', label: 'Pressure' },
              { id: 'water', label: 'Water' },
              { id: 'temp', label: 'Temp' },
              { id: 'humidity', label: 'Humidity' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedMetric === m.id
                    ? 'bg-[#161D2B] text-[#06B6D4] font-semibold'
                    : 'text-[#8C9BAE] hover:text-[#F0F4F8]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#8C9BAE]">
          <span>SAMPLE DEPTH:</span>
          {[15, 30, 50, 100].map((count) => (
            <button
              key={count}
              onClick={() => setSampleLimit(count)}
              className={`px-2 py-0.5 rounded border ${
                sampleLimit === count
                  ? 'bg-[#161D2B] border-[#06B6D4]/40 text-[#06B6D4] font-bold'
                  : 'bg-[#0B0E14] border-[#1E2638] text-[#8C9BAE] hover:text-[#F0F4F8]'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Metric Technical Readout Bar */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#111622] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase block">Latest Pressure</span>
            <span className="text-base font-bold text-[#F0F4F8] tabular-nums">
              {Number(latest.atmosphericPressureKpa).toFixed(2)} <span className="text-[10px] text-[#8C9BAE]">kPa</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#111622] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase block">Latest CO₂</span>
            <span className={`text-base font-bold tabular-nums ${Number(latest.co2LevelPpm) > 950 ? 'text-[#EF4444]' : 'text-[#F0F4F8]'}`}>
              {Number(latest.co2LevelPpm).toFixed(0)} <span className="text-[10px] text-[#8C9BAE]">PPM</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#111622] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase block">Water Reclamation</span>
            <span className="text-base font-bold text-[#10B981] tabular-nums">
              {Number(latest.waterPurityPercent).toFixed(1)} <span className="text-[10px] text-[#8C9BAE]">%</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#111622] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase block">Biosphere Temp</span>
            <span className="text-base font-bold text-[#F0F4F8] tabular-nums">
              {Number(latest.temperatureCelsius).toFixed(1)} <span className="text-[10px] text-[#8C9BAE]">°C</span>
            </span>
          </div>
          <div className="p-2.5 rounded bg-[#111622] border border-[#1E2638]">
            <span className="text-[10px] text-[#8C9BAE] uppercase block">Relative Humidity</span>
            <span className="text-base font-bold text-[#F0F4F8] tabular-nums">
              {Number(latest.humidityPercent).toFixed(0)} <span className="text-[10px] text-[#8C9BAE]">%</span>
            </span>
          </div>
        </div>
      )}

      {/* Historical Telemetry Trend Chart */}
      <div className="bg-[#111622] p-4 rounded border border-[#1E2638] font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E2638]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F0F4F8] uppercase tracking-wider">
              {metricMeta.name} ({metricMeta.unit}) Time-Series Telemetry
            </span>
            <span className="text-[10px] text-[#06B6D4]">
              {displaySamples.length} RECORDED OBSERVATIONS
            </span>
          </div>
          <span className="text-[10px] text-[#F59E0B]">
            {metricMeta.thresholdLabel}
          </span>
        </div>

        {displaySamples.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-[#5A677B]">
            No recorded telemetry observations match the selected criteria.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visualizer bars */}
            <div className="h-32 flex items-end gap-1 pt-4 pb-1 border-b border-[#1E2638]">
              {displaySamples.map((t, idx) => {
                const val = metricMeta.getValue(t);
                let heightPercent = 50;
                if (selectedMetric === 'co2') {
                  heightPercent = Math.min(100, Math.max(10, (val / 1500) * 100));
                } else if (selectedMetric === 'pressure') {
                  heightPercent = Math.min(100, Math.max(10, ((val - 90) / 20) * 100));
                } else if (selectedMetric === 'water') {
                  heightPercent = Math.min(100, Math.max(10, ((val - 90) / 10) * 100));
                } else if (selectedMetric === 'temp') {
                  heightPercent = Math.min(100, Math.max(10, (val / 40) * 100));
                } else if (selectedMetric === 'humidity') {
                  heightPercent = Math.min(100, Math.max(10, val));
                }

                const isCrit = metricMeta.isAbnormal(val);
                const isWarn = metricMeta.isWarning(val);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all ${
                        isCrit
                          ? 'bg-[#EF4444]'
                          : isWarn
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#06B6D4]/75 group-hover:bg-[#06B6D4]'
                      }`}
                    />
                    {/* Hover detail tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-30 px-2 py-1 rounded bg-[#070A0F] border border-[#1E2638] text-[10px] text-[#F0F4F8] whitespace-nowrap shadow-xl">
                      <div>Zone: {t.habitatZone?.code || 'DOME'}</div>
                      <div className="font-bold text-[#06B6D4]">{val} {metricMeta.unit}</div>
                      <div className="text-[9px] text-[#5A677B]">{t.recordedAt}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#5A677B]">
              <span>T-{(displaySamples.length).toString()} SAMPLES</span>
              <span>LATEST TIMESTAMP: {latest?.recordedAt || 'NOW'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Structured Telemetry Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="No sensor logs found for this sector selection."
      />
    </div>
  );
};
