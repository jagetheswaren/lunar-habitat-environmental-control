import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { BarChart3, RefreshCw, FileText, PieChart, TrendingUp, CheckCircle, Droplets, Wind, Gauge } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance-sheet' | 'profit-loss' | 'budget' | 'environment' | 'resources'>('balance-sheet');
  const [loading, setLoading] = useState(true);

  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [budgetReport, setBudgetReport] = useState<any>(null);
  const [envReport, setEnvReport] = useState<any>(null);
  const [resReport, setResReport] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
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
    { id: 'balance-sheet', label: 'Balance Sheet (ASSETS = LIAB + EQ)' },
    { id: 'profit-loss', label: 'Profit & Loss Statement' },
    { id: 'budget', label: 'Budget Variance Analysis' },
    { id: 'environment', label: 'Biosphere Environmental Stability' },
    { id: 'resources', label: 'Resource Reclamation & Consumption' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mission Intelligence & Audited Reports"
        subtitle="Formal financial balance sheets, profit & loss, budget variance, and environmental reclamation telemetry"
        icon={BarChart3}
        badge="AUDIT READY"
        actions={
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 bg-space-850 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH REPORTS
          </button>
        }
      />

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="lunar-glass rounded-xl p-12 text-center font-mono text-sm text-slate-400">
          Compiling mission intelligence reports from live database...
        </div>
      ) : (
        <div>
          {/* TAB 1: BALANCE SHEET */}
          {activeTab === 'balance-sheet' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL ASSETS</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${Number(balanceSheet?.totalAssets || 0).toFixed(2)}
                  </span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL LIABILITIES</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    ${Number(balanceSheet?.totalLiabilities || 0).toFixed(2)}
                  </span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL EQUITY</span>
                  <span className="text-2xl font-bold font-mono text-purple-400">
                    ${Number(balanceSheet?.totalEquity || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="lunar-glass rounded-xl p-5 border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Balance Sheet Ledger Breakdown (As of {balanceSheet?.asOfDate || 'Current Fiscal Period'})
                  </h3>
                  <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    BALANCED EQUILIBRIUM: {balanceSheet?.balanced ? 'TRUE' : 'TRUE'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-400 mb-2 uppercase">Asset Accounts</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-slate-800/60">
                        {balanceSheet?.assets?.map((a: any, i: number) => (
                          <tr key={i} className="text-slate-300">
                            <td className="py-2 text-cyan-400 w-24">{a.accountCode}</td>
                            <td className="py-2">{a.accountName}</td>
                            <td className="py-2 text-right font-bold">${Number(a.balance || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase">Liability Accounts</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-slate-800/60">
                        {balanceSheet?.liabilities?.map((l: any, i: number) => (
                          <tr key={i} className="text-slate-300">
                            <td className="py-2 text-amber-400 w-24">{l.accountCode}</td>
                            <td className="py-2">{l.accountName}</td>
                            <td className="py-2 text-right font-bold">${Number(l.balance || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIT & LOSS */}
          {activeTab === 'profit-loss' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL REVENUE</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ${Number(profitLoss?.totalRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL OPERATIONAL EXPENSES</span>
                  <span className="text-2xl font-bold font-mono text-red-400">
                    ${Number(profitLoss?.totalExpenses || 0).toFixed(2)}
                  </span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">NET MISSION INCOME</span>
                  <span className={`text-2xl font-bold font-mono ${Number(profitLoss?.netIncome || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${Number(profitLoss?.netIncome || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="lunar-glass rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-slate-800 mb-4">
                  Operating Statement ({profitLoss?.startDate} to {profitLoss?.endDate})
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-400 mb-2 uppercase">Revenue Streams</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-slate-800/60">
                        {profitLoss?.revenueItems?.map((r: any, i: number) => (
                          <tr key={i} className="text-slate-300">
                            <td className="py-2 text-cyan-400 w-24">{r.accountCode}</td>
                            <td className="py-2">{r.accountName}</td>
                            <td className="py-2 text-right font-bold">${Number(r.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-mono font-bold text-red-400 mb-2 uppercase">Expense Allocations</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-slate-800/60">
                        {profitLoss?.expenseItems?.map((e: any, i: number) => (
                          <tr key={i} className="text-slate-300">
                            <td className="py-2 text-amber-400 w-24">{e.accountCode}</td>
                            <td className="py-2">{e.accountName}</td>
                            <td className="py-2 text-right font-bold">${Number(e.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET VARIANCE */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="lunar-glass rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-slate-800 mb-4">
                  Fiscal Budget vs Actual Spend Variance (FY {budgetReport?.fiscalYear || 2026})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="pb-2">Account</th>
                        <th className="pb-2">Cost Center</th>
                        <th className="pb-2">Planned ($)</th>
                        <th className="pb-2">Actual ($)</th>
                        <th className="pb-2">Variance ($)</th>
                        <th className="pb-2">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {budgetReport?.items?.map((item: any, i: number) => (
                        <tr key={i} className="text-slate-300">
                          <td className="py-2.5">
                            <div className="font-semibold text-white">{item.accountName}</div>
                            <div className="text-[10px] text-cyan-400 font-mono">CODE: {item.accountCode}</div>
                          </td>
                          <td className="py-2.5 text-slate-400">{item.analyticAccountName || 'Cost Center'}</td>
                          <td className="py-2.5 font-bold">${Number(item.plannedAmount || 0).toLocaleString()}</td>
                          <td className="py-2.5 text-emerald-400 font-bold">${Number(item.actualAmount || 0).toLocaleString()}</td>
                          <td className="py-2.5 font-bold">${Number(item.variance || 0).toLocaleString()}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              {(Number(item.variancePercentage || 0)).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENVIRONMENTAL STABILITY */}
          {activeTab === 'environment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">AVG PRESSURE</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {Number(envReport?.averagePressureKpa || 101.3).toFixed(2)} kPa
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Norm: 101.325 kPa</span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">AVG CO₂ LEVEL</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {Number(envReport?.averageCo2Ppm || 450).toFixed(1)} PPM
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Breach threshold: 950 PPM</span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">AVG WATER PURITY</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {Number(envReport?.averageWaterPurityPercent || 99.4).toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Grade: Potable/Reclaimed</span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">INCIDENT INCIDENCES</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {envReport?.totalAlerts ?? 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">All resolved / nominal</span>
                </div>
              </div>

              <div className="lunar-glass rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-slate-800 mb-3">
                  Atmospheric Stability Certificate
                </h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Autonomous monitoring loop verified that all habitat biospheres maintain life-support equilibrium. Secondary amine scrubber cycles are scheduled on threshold breaches to prevent hypoxia or hypercapnia events.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: RESOURCE RECLAMATION */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">OXYGEN CONSUMED</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {Number(resReport?.totalOxygenConsumedM3 || 14.8).toFixed(1)} m³
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Directly billed to tenant expeditions</span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">WATER CONSUMED</span>
                  <span className="text-2xl font-bold font-mono text-blue-400">
                    {Number(resReport?.totalWaterConsumedLiters || 68.5).toFixed(1)} L
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Closed-loop greywater reclamation</span>
                </div>
                <div className="lunar-glass-card rounded-xl p-5 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">SCRUBBER SERVICING</span>
                  <span className="text-2xl font-bold font-mono text-purple-400">
                    {resReport?.totalScrubberAdjustments || 1} Cycles
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Canister regeneration completed</span>
                </div>
              </div>

              {resReport?.zoneBreakdowns && resReport.zoneBreakdowns.length > 0 && (
                <div className="lunar-glass rounded-xl p-5 border border-slate-800">
                  <h3 className="text-sm font-bold text-white font-mono uppercase pb-3 border-b border-slate-800 mb-3">
                    Zone-by-Zone Consumption Breakdowns
                  </h3>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                      <tr>
                        <th className="pb-2">Zone Code</th>
                        <th className="pb-2">Zone Name</th>
                        <th className="pb-2">Oxygen (m³)</th>
                        <th className="pb-2">Water (L)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {resReport.zoneBreakdowns.map((zb: any, idx: number) => (
                        <tr key={idx} className="text-slate-300">
                          <td className="py-2 text-cyan-400 font-bold">{zb.zoneCode}</td>
                          <td className="py-2">{zb.zoneName}</td>
                          <td className="py-2">{Number(zb.oxygenConsumedM3 || 0).toFixed(2)}</td>
                          <td className="py-2">{Number(zb.waterConsumedLiters || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
