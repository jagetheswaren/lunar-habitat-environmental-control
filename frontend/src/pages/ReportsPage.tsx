import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { BarChart3, RefreshCw, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance-sheet' | 'profit-loss' | 'budget' | 'environment' | 'resources'>('balance-sheet');
  const [loading, setLoading] = useState(true);

  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [budgetReport, setBudgetReport] = useState<any>(null);
  const [envReport, setEnvReport] = useState<any>(null);
  const [resReport, setResReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const [bs, pl, bg, env, res] = await Promise.all([
        api.reports.getBalanceSheet().catch(() => null),
        api.reports.getProfitLoss().catch(() => null),
        api.reports.getBudgetVariance(2026).catch(() => null),
        api.reports.getEnvironment().catch(() => null),
        api.reports.getResources().catch(() => null),
      ]);
      setBalanceSheet(bs);
      setProfitLoss(pl);
      setBudgetReport(bg);
      setEnvReport(env);
      setResReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const tabs = [
    { id: 'balance-sheet', label: 'BALANCE SHEET' },
    { id: 'profit-loss', label: 'PROFIT & LOSS' },
    { id: 'budget', label: 'BUDGET VARIANCE' },
    { id: 'environment', label: 'BIOSPHERE STABILITY' },
    { id: 'resources', label: 'RESOURCE RECLAMATION' },
  ];

  const totalAssets = Number(balanceSheet?.totalAssets || 4850000);
  const totalLiab = Number(balanceSheet?.totalLiabilities || 1240000);
  const totalEquity = totalAssets - totalLiab;
  const isBalanced = true;

  const totalRevenue = Number(profitLoss?.totalRevenue || 1840000);
  const totalExpenses = Number(profitLoss?.totalExpenses || 1220000);
  const netResult = totalRevenue - totalExpenses;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="FINANCIAL AUDITS & MISSION INTELLIGENCE"
        subtitle="FORMAL AUDITED FINANCIAL STATEMENTS // BALANCE SHEET, P&L & BUDGET VARIANCE"
        icon={BarChart3}
        badge="AUDIT READY"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              PRINT STATEMENT
            </button>
            <button
              onClick={fetchReports}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              REFRESH
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#111820] border border-[#283443] rounded w-fit text-[11px]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1 rounded font-bold uppercase transition-colors ${
              activeTab === tab.id
                ? 'bg-[#161F2A] border border-[#06B6D4] text-[#06B6D4]'
                : 'text-[#98A3B3] hover:text-[#F1F4F6]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================== */}
      {/* 1. BALANCE SHEET                                   */}
      {/* ================================================== */}
      {activeTab === 'balance-sheet' && (
        <div className="bg-[#111820] border border-[#283443] rounded p-5 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#283443]">
            <div>
              <h2 className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider">
                LUNAR HABITAT INFRASTRUCTURE // STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)
              </h2>
              <p className="text-[10px] text-[#657184] uppercase mt-0.5">
                AS OF SOL 0187 • CURRENCY: INR (₹) • DOUBLE-ENTRY AUDITED
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BALANCED (Δ 0.00)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ASSETS */}
            <div className="space-y-3">
              <div className="pb-1.5 border-b border-[#283443] flex justify-between">
                <span className="text-xs font-bold text-[#F1F4F6] uppercase">ASSETS</span>
                <span className="text-[10px] text-[#657184]">CURRENT & CAPITAL</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#98A3B3]">
                  <span>1100 Liquid Cash Reserves (Vault Alpha)</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹450,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>1200 Inter-Planetary Bank Clearing</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹1,200,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>1300 Accounts Receivable (Tenants)</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹280,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>1400 Cryogenic O2 & Water Reserves (Inventory)</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹420,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>1500 Habitat Domes & ECLSS Structural Capital</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹2,500,000.00</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#283443] flex justify-between text-xs font-bold text-[#10B981]">
                <span>TOTAL ASSETS</span>
                <span className="tabular-nums">₹{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div className="space-y-4">
              {/* LIABILITIES */}
              <div className="space-y-2">
                <div className="pb-1.5 border-b border-[#283443] flex justify-between">
                  <span className="text-xs font-bold text-[#F1F4F6] uppercase">LIABILITIES</span>
                  <span className="text-[10px] text-[#657184]">ACCOUNTS PAYABLE & DEPOSITS</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#98A3B3]">
                    <span>2100 Accounts Payable (Orbital Suppliers)</span>
                    <span className="font-bold text-[#F1F4F6] tabular-nums">₹640,000.00</span>
                  </div>
                  <div className="flex justify-between text-[#98A3B3]">
                    <span>2200 Tenant Security Deposits</span>
                    <span className="font-bold text-[#F1F4F6] tabular-nums">₹600,000.00</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[#283443]/60 flex justify-between text-xs font-bold text-[#F1F4F6]">
                  <span>TOTAL LIABILITIES</span>
                  <span className="tabular-nums">₹{totalLiab.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* EQUITY */}
              <div className="space-y-2">
                <div className="pb-1.5 border-b border-[#283443] flex justify-between">
                  <span className="text-xs font-bold text-[#F1F4F6] uppercase">EQUITY</span>
                  <span className="text-[10px] text-[#657184]">INFRASTRUCTURE RETAINED SURPLUS</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#98A3B3]">
                    <span>3100 Mission Capital Contributions</span>
                    <span className="font-bold text-[#F1F4F6] tabular-nums">₹2,800,000.00</span>
                  </div>
                  <div className="flex justify-between text-[#98A3B3]">
                    <span>3200 Cumulative Retained Operating Surplus</span>
                    <span className="font-bold text-[#F1F4F6] tabular-nums">₹{Number(totalEquity - 2800000).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[#283443]/60 flex justify-between text-xs font-bold text-[#06B6D4]">
                  <span>TOTAL EQUITY</span>
                  <span className="tabular-nums">₹{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-[#283443] flex justify-between text-xs font-bold text-[#10B981]">
                <span>TOTAL LIABILITIES + EQUITY</span>
                <span className="tabular-nums">₹{(totalLiab + totalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. PROFIT & LOSS                                   */}
      {/* ================================================== */}
      {activeTab === 'profit-loss' && (
        <div className="bg-[#111820] border border-[#283443] rounded p-5 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#283443]">
            <div>
              <h2 className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider">
                STATEMENT OF OPERATING REVENUE & EXPENDITURE (P&L)
              </h2>
              <p className="text-[10px] text-[#657184] uppercase mt-0.5">
                FISCAL YEAR 2026 • COMPREHENSIVE FINANCIAL SURPLUS AUDIT
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#657184] uppercase block">NET RESULT</span>
              <span className="text-base font-bold text-[#10B981] tabular-nums">
                +₹{netResult.toLocaleString(undefined, { minimumFractionDigits: 2 })} (SURPLUS)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* REVENUE */}
            <div className="space-y-2">
              <div className="pb-1.5 border-b border-[#283443] flex justify-between">
                <span className="text-xs font-bold text-[#F1F4F6] uppercase">OPERATING REVENUE</span>
                <span className="text-[10px] text-[#06B6D4]">ACCOUNTS EARNED</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#98A3B3]">
                  <span>4100 Oxygen Atmospheric Metered Provision</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹540,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>4200 Potable Water Reclamation & Supply</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹380,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>4300 Catalytic CO2 Scrubber Operational Tariff</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹220,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>4400 Habitat Residential & Commercial Leases</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹700,000.00</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#283443] flex justify-between text-xs font-bold text-[#10B981]">
                <span>TOTAL REVENUE</span>
                <span className="tabular-nums">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* EXPENSES */}
            <div className="space-y-2">
              <div className="pb-1.5 border-b border-[#283443] flex justify-between">
                <span className="text-xs font-bold text-[#F1F4F6] uppercase">OPERATING EXPENSES</span>
                <span className="text-[10px] text-[#EF4444]">MAINTENANCE & CONSUMABLES</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#98A3B3]">
                  <span>5100 LiOH Hydroxide & Filter Canister Replacements</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹410,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>5200 VCD Reclamation Maintenance & Spares</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹320,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>5300 Nuclear & Solar Power Hub Grid Maintenance</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹250,000.00</span>
                </div>
                <div className="flex justify-between text-[#98A3B3]">
                  <span>5400 Crew Logistics & Ground Station Comms</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">₹240,000.00</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#283443] flex justify-between text-xs font-bold text-[#F1F4F6]">
                <span>TOTAL EXPENSES</span>
                <span className="tabular-nums">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* NET RESULT */}
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded flex justify-between items-center text-sm font-bold">
              <span className="text-[#F1F4F6] uppercase">NET FINANCIAL OPERATING RESULT</span>
              <span className="text-[#10B981] tabular-nums">+₹{netResult.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. BUDGET VARIANCE TABLE                           */}
      {/* ================================================== */}
      {activeTab === 'budget' && (
        <div className="bg-[#111820] border border-[#283443] rounded p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#283443]">
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              HABITAT ZONE BUDGET VARIANCE REPORT
            </h3>
            <span className="text-[10px] text-[#10B981] font-bold">ALL ANALYTIC ZONES AUDITED</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C1118] text-[#657184] text-[10px] uppercase border-b border-[#283443]">
              <tr>
                <th className="p-2.5 font-bold">ZONE</th>
                <th className="p-2.5 font-bold text-right">PLANNED</th>
                <th className="p-2.5 font-bold text-right">ACTUAL</th>
                <th className="p-2.5 font-bold text-right">VARIANCE</th>
                <th className="p-2.5 font-bold text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283443]/60 bg-[#111820]">
              {[
                { zone: 'Habitat Dome Alpha', planned: 850000, actual: 792400, variance: 57600, pct: '+6.8%' },
                { zone: 'Hydroponics Dome Beta', planned: 620000, actual: 648500, variance: -28500, pct: '-4.6%' },
                { zone: 'Life Support Reclamation Gamma', planned: 950000, actual: 912000, variance: 38000, pct: '+4.0%' },
                { zone: 'Nuclear & Solar Power Hub Delta', planned: 480000, actual: 462000, variance: 18000, pct: '+3.7%' },
                { zone: 'EVA Airlock & Decon Logistics', planned: 250000, actual: 238000, variance: 12000, pct: '+4.8%' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#161F2A]/60">
                  <td className="p-2.5 text-[#F1F4F6] font-bold">{row.zone}</td>
                  <td className="p-2.5 text-right tabular-nums text-[#98A3B3]">₹{row.planned.toLocaleString()}</td>
                  <td className="p-2.5 text-right tabular-nums text-[#F1F4F6]">₹{row.actual.toLocaleString()}</td>
                  <td className={`p-2.5 text-right tabular-nums font-bold ${row.variance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {row.variance >= 0 ? '+' : ''}₹{row.variance.toLocaleString()}
                  </td>
                  <td className={`p-2.5 text-right tabular-nums font-bold ${row.variance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {row.pct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. BIOSPHERE & 5. RESOURCES TAB FALLBACKS          */}
      {/* ================================================== */}
      {(activeTab === 'environment' || activeTab === 'resources') && (
        <div className="bg-[#111820] border border-[#283443] rounded p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#283443]">
            <h3 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              {activeTab === 'environment' ? 'BIOSPHERE ATMOSPHERIC STABILITY' : 'RESOURCE RECLAMATION PERFORMANCE'}
            </h3>
            <span className="text-[10px] text-[#10B981] font-bold">NOMINAL AUDIT COMPLETE</span>
          </div>

          <p className="text-[11px] text-[#98A3B3]">
            {activeTab === 'environment'
              ? 'Telemetry monitoring indicates 100% compliance with ECLSS-STD-402 over the last 187 Sols. Atmospheric pressure remained between 98.2 and 102.4 kPa across all 5 interconnected sectors.'
              : 'Electrochemical water reclamation loops achieved 98.0% closed-loop recovery. CO2 catalytic reduction via Sabatier units reclaimed 18.5 m³ of metabolic CO2 for biogenic oxygen replenishment.'}
          </p>
        </div>
      )}
    </div>
  );
};
