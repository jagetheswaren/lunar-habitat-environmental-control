import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Activity, RefreshCw, Layers, ShieldCheck, Gauge } from 'lucide-react';

export const OxygenPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Oxygen engineering parameters
  const genRate = 18.2; // LPM
  const consRate = latest?.oxygenConsumptionRateLpm ? Number(latest.oxygenConsumptionRateLpm) : 14.5; // LPM
  const reclaimed = 13.8; // LPM
  const totalReserveLitres = 84200;
  const maxCapacityLitres = 91000;
  const reservePercent = ((totalReserveLitres / maxCapacityLitres) * 100).toFixed(1);
  const netSurplus = (genRate - consRate).toFixed(1);
  const enduranceHours = Math.round(totalReserveLitres / ((consRate - reclaimed) * 60) * 10) / 10;
  const systemEfficiency = '95.2%';

  // Storage tanks
  const tanks = [
    { id: 'O2-TANK-ALPHA', label: 'PRIMARY LIQUID O2 DEWAR', current: 38400, capacity: 40000, temp: '-183.0 °C', press: '14.2 bar', status: 'NOMINAL' },
    { id: 'O2-TANK-BETA', label: 'SECONDARY LIQUID O2 DEWAR', current: 36800, capacity: 40000, temp: '-182.8 °C', press: '14.1 bar', status: 'NOMINAL' },
    { id: 'O2-BUFFER-GAMMA', label: 'HIGH-PRESSURE GASEOUS BUFFER', current: 9000, capacity: 11000, temp: '21.0 °C', press: '210.0 bar', status: 'NOMINAL' },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="OXYGEN GENERATION & RESERVE BUFFER"
        subtitle="ELECTROCHEMICAL O2 GENERATION (OGS) // CRYOGENIC DEWARS & RESIDENTIAL DEMAND"
        icon={Activity}
        badge="OGS SUB-01"
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

      {/* Primary Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">GENERATION RATE</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{genRate}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">CONSUMPTION RATE</span>
          <span className="text-xl font-bold text-[#F1F4F6] tabular-nums">{consRate.toFixed(1)}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">RECLAIMED AMOUNT</span>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{reclaimed}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">NET SURPLUS</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">+{netSurplus}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">EST. ENDURANCE</span>
          <span className="text-xl font-bold text-[#F1F4F6] tabular-nums">{enduranceHours}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">SOLS</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">SYSTEM EFFICIENCY</span>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{systemEfficiency}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">ECLSS</span>
        </div>
      </div>

      {/* Storage Tanks as Technical Level Indicators */}
      <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
          <div>
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              PRIMARY OXYGEN STORAGE TANKS // TECHNICAL LEVEL INDICATORS
            </h3>
            <p className="text-[10px] text-[#657184] uppercase mt-0.5">
              REAL-TIME CRYOGENIC HYDROSTATIC MASS & VOLUMETRIC METRIC
            </p>
          </div>
          <span className="text-xs font-bold text-[#10B981]">{reservePercent}% TOTAL CAPACITY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tanks.map((tank, idx) => {
            const fillPercent = ((tank.current / tank.capacity) * 100).toFixed(1);
            return (
              <div key={idx} className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#06B6D4] text-xs">{tank.id}</span>
                  <StatusBadge status={tank.status} size="sm" />
                </div>
                <p className="text-[10px] text-[#657184] uppercase">{tank.label}</p>

                {/* Technical Tank Bar Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-[#F1F4F6] tabular-nums">{tank.current.toLocaleString()} L</span>
                    <span className="text-[#06B6D4] tabular-nums">{fillPercent}%</span>
                  </div>
                  <div className="h-4 bg-[#161F2A] border border-[#283443] rounded-sm overflow-hidden flex">
                    <div
                      className="bg-[#06B6D4] transition-all duration-300"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#657184]">
                    <span>0 L (EMPTY)</span>
                    <span>MAX: {tank.capacity.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Thermodynamic telemetry */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#283443] text-[10px]">
                  <div>
                    <span className="text-[#657184] uppercase block">TEMPERATURE</span>
                    <span className="text-[#F1F4F6] font-bold">{tank.temp}</span>
                  </div>
                  <div>
                    <span className="text-[#657184] uppercase block">HEAD PRESSURE</span>
                    <span className="text-[#F1F4F6] font-bold">{tank.press}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
