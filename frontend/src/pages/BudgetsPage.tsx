import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Calculator, RefreshCw, Layers, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const [data, setData] = useState<T.Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBudgets = async () => {
    try {
      const records = await api.budgets.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const analyticSectors = [
    {
      name: 'HABITAT DOME ALPHA (CREW SECTOR)',
      code: 'ANALYTIC-A01',
      budget: 850000,
      actual: 792400,
      variance: 57600,
      variancePct: '+6.8%',
      favorable: true,
      breakdown: [
        { label: 'O2 Metabolic Consumption', planned: 240000, actual: 228000 },
        { label: 'LiOH Scrubber Servicing', planned: 180000, actual: 174000 },
        { label: 'Habitation Thermal Regulation', planned: 230000, actual: 215400 },
        { label: 'Structural Seal Maintenance', planned: 200000, actual: 175000 },
      ],
    },
    {
      name: 'HYDROPONICS DOME BETA (AGRI SECTOR)',
      code: 'ANALYTIC-B02',
      budget: 620000,
      actual: 648500,
      variance: -28500,
      variancePct: '-4.6%',
      favorable: false,
      breakdown: [
        { label: 'Nutrient Solution Injection', planned: 180000, actual: 195000 },
        { label: 'LED Photosynthetic Lighting', planned: 240000, actual: 252000 },
        { label: 'Humidity Condensate Sump', planned: 120000, actual: 121500 },
        { label: 'Biomass Extrusion System', planned: 80000, actual: 80000 },
      ],
    },
    {
      name: 'LIFE SUPPORT RECLAMATION (ECLSS)',
      code: 'ANALYTIC-G03',
      budget: 950000,
      actual: 912000,
      variance: 38000,
      variancePct: '+4.0%',
      favorable: true,
      breakdown: [
        { label: 'VCD Vapor Compression Distillation', planned: 320000, actual: 305000 },
        { label: 'Catalytic Sabatier Reduction Loop', planned: 350000, actual: 338000 },
        { label: 'Electrochemical Water Electrolysis', planned: 180000, actual: 178000 },
        { label: 'High-Pressure Gas Compressors', planned: 100000, actual: 91000 },
      ],
    },
    {
      name: 'POWER HUB & NUCLEAR FISSION (ENERGY)',
      code: 'ANALYTIC-D04',
      budget: 480000,
      actual: 462000,
      variance: 18000,
      variancePct: '+3.7%',
      favorable: true,
      breakdown: [
        { label: 'Stirling Engine Alternators', planned: 150000, actual: 144000 },
        { label: 'Solar Tracking Actuators', planned: 140000, actual: 136000 },
        { label: 'High-Voltage Solid-State Bus', planned: 110000, actual: 108000 },
        { label: 'Coolant Loop Maintenance', planned: 80000, actual: 74000 },
      ],
    },
  ];

  const totalBudget = analyticSectors.reduce((sum, s) => sum + s.budget, 0);
  const totalActual = analyticSectors.reduce((sum, s) => sum + s.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const overallVariancePct = ((totalVariance / totalBudget) * 100).toFixed(1);

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="ANALYTIC COST CENTERS & OPERATIONAL BUDGETS"
        subtitle="ANALYTIC ACCOUNT EXPENDITURE // SECTOR VARIANCE & CONSUMPTION AUDIT"
        icon={Calculator}
        badge="FY 2026 ACTIVE"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchBudgets();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Grand Budget Summary Rail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase font-bold block">TOTAL PLANNED BUDGET</span>
          <span className="text-xl font-bold text-[#F1F4F6] tabular-nums">
            ₹{totalBudget.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#98A3B3] block mt-0.5">FY 2026 ALLOCATION</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase font-bold block">ACTUAL EXPENDITURE</span>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">
            ₹{totalActual.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#98A3B3] block mt-0.5">ACCOUNTS AUDITED</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase font-bold block">NET VARIANCE</span>
          <span
            className={`text-xl font-bold tabular-nums ${
              totalVariance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}
          >
            {totalVariance >= 0 ? '+' : ''}₹{totalVariance.toLocaleString()}
          </span>
          <span className="text-[9px] text-[#10B981] block mt-0.5">FAVORABLE SURPLUS</span>
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded">
          <span className="text-[10px] text-[#657184] uppercase font-bold block">VARIANCE HEADROOM</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">+{overallVariancePct}%</span>
          <span className="text-[9px] text-[#657184] block mt-0.5">WITHIN OPERATIONAL TARGET</span>
        </div>
      </div>

      {/* Analytic Account Cards with Compact Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analyticSectors.map((sector, idx) => {
          const usedPct = Math.min(100, Math.round((sector.actual / sector.budget) * 100));

          return (
            <div key={idx} className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
                <div>
                  <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
                    {sector.name}
                  </h3>
                  <span className="text-[10px] text-[#06B6D4] font-semibold">{sector.code}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    sector.favorable
                      ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                      : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                  }`}
                >
                  {sector.variancePct} {sector.favorable ? 'FAVORABLE' : 'DEFICIT'}
                </span>
              </div>

              {/* Summary Values */}
              <div className="grid grid-cols-3 gap-2 bg-[#0C1118] border border-[#283443] rounded p-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] uppercase block">BUDGET</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹{sector.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] uppercase block">ACTUAL</span>
                  <span className="font-bold text-[#06B6D4] tabular-nums">₹{sector.actual.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] uppercase block">VARIANCE</span>
                  <span className={`font-bold tabular-nums ${sector.favorable ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {sector.favorable ? '+' : ''}₹{sector.variance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Linear Progress Bar (No circular charts) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#657184]">
                  <span>BUDGET CONSUMED: <strong className="text-[#F1F4F6]">{usedPct}%</strong></span>
                  <span>HEADROOM: <strong className="text-[#10B981]">{100 - usedPct}%</strong></span>
                </div>
                <div className="h-2 bg-[#0C1118] border border-[#283443] rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      usedPct > 100 ? 'bg-[#EF4444]' : usedPct > 90 ? 'bg-[#F59E0B]' : 'bg-[#06B6D4]'
                    }`}
                    style={{ width: `${Math.min(100, usedPct)}%` }}
                  />
                </div>
              </div>

              {/* Compact Breakdown */}
              <div className="space-y-1 pt-1 border-t border-[#283443]/60 text-[10px]">
                <span className="text-[#657184] uppercase block font-bold mb-1">
                  SUB-SYSTEM EXPENDITURE BREAKDOWN
                </span>
                {sector.breakdown.map((item, bIdx) => (
                  <div key={bIdx} className="flex items-center justify-between py-1 border-b border-[#283443]/30">
                    <span className="text-[#98A3B3]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#657184]">PLANNED: ₹{item.planned.toLocaleString()}</span>
                      <span className="text-[#F1F4F6] font-bold">ACTUAL: ₹{item.actual.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
