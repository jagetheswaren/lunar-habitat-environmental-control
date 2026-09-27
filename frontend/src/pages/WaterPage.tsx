import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Droplets, RefreshCw, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export const WaterPage: React.FC = () => {
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

  const potableReserve = 42800; // Litres
  const potableCapacity = 48000;
  const consumptionLpm = latest?.waterConsumptionRateLpm ? Number(latest.waterConsumptionRateLpm) : 3.2;
  const greywaterReturnLpm = 2.95;
  const recoveryLpm = 2.89;
  const purity = latest?.waterPurityPercent ? Number(latest.waterPurityPercent).toFixed(1) : '99.4';
  const reclamationEfficiency = '98.0%';

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="CLOSED-LOOP HYDROLOGICAL PROCESS & PURIFICATION"
        subtitle="POTABLE BUFFER // GREYWATER RECOVERY & ELECTROCHEMICAL PURITY SYSTEM"
        icon={Droplets}
        badge="WRS-01"
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">POTABLE RESERVE</span>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{potableReserve.toLocaleString()}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">L</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">CONSUMPTION RATE</span>
          <span className="text-xl font-bold text-[#F1F4F6] tabular-nums">{consumptionLpm.toFixed(1)}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">GREYWATER RETURN</span>
          <span className="text-xl font-bold text-[#F59E0B] tabular-nums">{greywaterReturnLpm}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">RECOVERY OUTPUT</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{recoveryLpm}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">LPM</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">POTABLE PURITY</span>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{purity}%</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">TDS &lt; 5</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase block font-bold">RECLAMATION EFF.</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{reclamationEfficiency}</span>
          <span className="text-[10px] text-[#98A3B3] ml-1">CLOSED</span>
        </div>
      </div>

      {/* Industrial Process Flow */}
      <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
          <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
            HYDROLOGICAL RECLAMATION PROCESS FLOW
          </h3>
          <span className="text-[10px] text-[#10B981] font-bold">ALL STAGES SYNCHRONIZED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1 */}
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
            <span className="text-[10px] text-[#657184] font-bold block">01 // COLLECTION</span>
            <h4 className="text-xs font-bold text-[#F1F4F6]">GREYWATER INTAKE</h4>
            <div className="text-[11px] text-[#98A3B3]">
              <div>INFLOW: <strong className="text-[#F1F4F6]">2.95 LPM</strong></div>
              <div>TURBIDITY: <strong className="text-[#F59E0B]">42 NTU</strong></div>
            </div>
            <div className="pt-2 text-[9px] text-[#10B981] uppercase font-bold">PUMP A-01: NOMINAL</div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
            <span className="text-[10px] text-[#657184] font-bold block">02 // DISTILLATION</span>
            <h4 className="text-xs font-bold text-[#F1F4F6]">VAPOR COMPRESSION</h4>
            <div className="text-[11px] text-[#98A3B3]">
              <div>BOILING TEMP: <strong className="text-[#F1F4F6]">65.2 °C</strong></div>
              <div>VACUUM: <strong className="text-[#F1F4F6]">24 kPa</strong></div>
            </div>
            <div className="pt-2 text-[9px] text-[#10B981] uppercase font-bold">STATION VCD: ONLINE</div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
            <span className="text-[10px] text-[#657184] font-bold block">03 // CATALYSIS</span>
            <h4 className="text-xs font-bold text-[#F1F4F6]">UV & CATALYTIC OXIDATION</h4>
            <div className="text-[11px] text-[#98A3B3]">
              <div>UV DOSAGE: <strong className="text-[#F1F4F6]">400 mJ/cm²</strong></div>
              <div>TOC REMOVAL: <strong className="text-[#10B981]">99.8%</strong></div>
            </div>
            <div className="pt-2 text-[9px] text-[#10B981] uppercase font-bold">LAMPS: ACTIVE</div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
            <span className="text-[10px] text-[#657184] font-bold block">04 // POLISHING</span>
            <h4 className="text-xs font-bold text-[#F1F4F6]">MINERAL INJECTION</h4>
            <div className="text-[11px] text-[#98A3B3]">
              <div>PURITY: <strong className="text-[#06B6D4]">{purity}%</strong></div>
              <div>pH TARGET: <strong className="text-[#F1F4F6]">7.25</strong></div>
            </div>
            <div className="pt-2 text-[9px] text-[#10B981] uppercase font-bold">ION RESIN: 84% LIFE</div>
          </div>

          {/* Step 5 */}
          <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
            <span className="text-[10px] text-[#657184] font-bold block">05 // BUFFER</span>
            <h4 className="text-xs font-bold text-[#F1F4F6]">POTABLE RESERVOIR</h4>
            <div className="text-[11px] text-[#98A3B3]">
              <div>STORED: <strong className="text-[#06B6D4]">{potableReserve.toLocaleString()} L</strong></div>
              <div>CAPACITY: <strong className="text-[#F1F4F6]">89.2%</strong></div>
            </div>
            <div className="pt-2 text-[9px] text-[#10B981] uppercase font-bold">STORAGE: PRESSURIZED</div>
          </div>
        </div>
      </div>
    </div>
  );
};
