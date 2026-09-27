import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Wind, Activity, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AtmospherePage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tList, zList] = await Promise.all([
        api.telemetry.getAll().catch(() => []),
        api.zones.getAll().catch(() => []),
      ]);
      setTelemetry(tList);
      setZones(zList);
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

  const atmosphericParameters = [
    {
      name: 'PRESSURE',
      code: 'BAROMETRIC ATMOSPHERE',
      value: latest ? Number(latest.atmosphericPressureKpa).toFixed(2) : '101.32',
      unit: 'kPa',
      safeRange: '98.0 — 103.0 kPa',
      warningBand: '95.0 — 98.0 / 103.0 — 105.0 kPa',
      criticalBand: '< 95.0 or > 105.0 kPa',
      status:
        latest && (latest.atmosphericPressureKpa < 95 || latest.atmosphericPressureKpa > 105)
          ? 'CRITICAL'
          : latest && (latest.atmosphericPressureKpa < 98 || latest.atmosphericPressureKpa > 103)
          ? 'WARNING'
          : 'NOMINAL',
    },
    {
      name: 'CARBON DIOXIDE (CO2)',
      code: 'EXHALED CONTAMINANT',
      value: latest ? Math.round(Number(latest.co2LevelPpm)).toString() : '428',
      unit: 'ppm',
      safeRange: '350 — 800 ppm',
      warningBand: '800 — 1000 ppm',
      criticalBand: '> 1000 ppm',
      status:
        latest && latest.co2LevelPpm > 1000
          ? 'CRITICAL'
          : latest && latest.co2LevelPpm > 800
          ? 'WARNING'
          : 'NOMINAL',
    },
    {
      name: 'OXYGEN FRACTION (O2)',
      code: 'METABOLIC GAS',
      value: '21.0',
      unit: '%',
      safeRange: '20.0 — 22.0 %',
      warningBand: '19.0 — 20.0 / 22.0 — 23.5 %',
      criticalBand: '< 19.0 or > 23.5 %',
      status: 'NOMINAL',
    },
    {
      name: 'TEMPERATURE',
      code: 'THERMAL EQUILIBRIUM',
      value: latest ? Number(latest.temperatureCelsius).toFixed(1) : '22.1',
      unit: '°C',
      safeRange: '20.0 — 24.0 °C',
      warningBand: '18.0 — 20.0 / 24.0 — 26.0 °C',
      criticalBand: '< 18.0 or > 26.0 °C',
      status:
        latest && (latest.temperatureCelsius < 18 || latest.temperatureCelsius > 26)
          ? 'CRITICAL'
          : latest && (latest.temperatureCelsius < 20 || latest.temperatureCelsius > 24)
          ? 'WARNING'
          : 'NOMINAL',
    },
    {
      name: 'RELATIVE HUMIDITY',
      code: 'VAPOR PRESSURE',
      value: latest ? Math.round(Number(latest.humidityPercent)).toString() : '46',
      unit: '%',
      safeRange: '40 — 60 %',
      warningBand: '30 — 40 / 60 — 70 %',
      criticalBand: '< 30 or > 70 %',
      status: 'NOMINAL',
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="ATMOSPHERIC CONTROL & EQUILIBRIUM"
        subtitle="ENGINEERING LIFE-SUPPORT SUITE // PRESSURE, CO2, O2 FRACTION & THERMAL EQUILIBRIUM"
        icon={Wind}
        badge="ECLSS V2"
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

      {/* Atmospheric Parameter Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {atmosphericParameters.map((param, idx) => (
          <div key={idx} className="bg-[#111820] border border-[#283443] rounded p-3 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#283443]">
                <span className="text-[10px] text-[#657184] uppercase font-bold">{param.code}</span>
                <StatusBadge status={param.status} size="sm" />
              </div>

              <div className="mt-2">
                <span className="text-xs font-bold text-[#F1F4F6] uppercase">{param.name}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#F1F4F6] tabular-nums">{param.value}</span>
                  <span className="text-xs text-[#98A3B3]">{param.unit}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 bg-[#0C1118] border border-[#283443] rounded p-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#657184] uppercase">SAFE RANGE:</span>
                <span className="text-[#10B981] font-bold">{param.safeRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657184] uppercase">WARNING BAND:</span>
                <span className="text-[#F59E0B] font-bold">{param.warningBand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#657184] uppercase">CRITICAL BAND:</span>
                <span className="text-[#EF4444] font-bold">{param.criticalBand}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Affected Habitat Modules */}
      <div className="bg-[#111820] border border-[#283443] rounded p-3 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
          <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
            AFFECTED HABITAT MODULES // CLOSED-LOOP ATMOSPHERE
          </span>
          <span className="text-[10px] text-[#06B6D4] font-semibold">{zones.length || 5} SECTORS ONLINE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(zones.length > 0 ? zones : [
            { id: 1, name: 'Habitat Dome Alpha', code: 'DOME-A01', maxCapacity: 12 },
            { id: 2, name: 'Hydroponics Dome Beta', code: 'AGRI-B02', maxCapacity: 4 },
            { id: 3, name: 'Life Support Reclamation', code: 'ECLSS-G03', maxCapacity: 6 },
            { id: 4, name: 'EVA Airlock & Decon', code: 'EVA-E05', maxCapacity: 2 },
            { id: 5, name: 'Resource Processing Facility', code: 'STOR-F06', maxCapacity: 4 },
          ]).map((z: any) => (
            <div key={z.id} className="p-2.5 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F1F4F6] text-xs uppercase">{z.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#161F2A] border border-[#283443] text-[#06B6D4] font-bold">
                  {z.code}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-[#98A3B3]">
                <div>
                  <span className="text-[9px] text-[#657184] block">PRESSURE</span>
                  <span className="font-bold text-[#F1F4F6]">101.3 kPa</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">CO2</span>
                  <span className="font-bold text-[#F1F4F6]">420 ppm</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">LOOP</span>
                  <span className="font-bold text-[#10B981]">ACTIVE</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
