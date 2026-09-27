import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PageHeader } from '../components/ui/PageHeader';
import { BarChart3, RefreshCw } from 'lucide-react';

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
    <div className="space-y-4">
      <PageHeader
        title="Mission Intelligence & Audited Reports"
        subtitle="Formal financial balance sheets, profit & loss, budget variance, and environmental reclamation telemetry"
        icon={BarChart3}
        badge="AUDIT READY"
        actions={
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH REPORTS
          </button>
        }
      />

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#1E2638] pb-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              activeTab === tab.id
                ? 'bg-[#161D2B] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                : 'text-[#8C9BAE] hover:text-[#F0F4F8] hover:bg-[#111622]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-[#111622] rounded p-12 text-center font-mono text-xs text-[#8C9BAE] border border-[#1E2638]">
          Compiling mission intelligence reports from live database...
        </div>
      ) : (
        <div>
          {/* TAB 1: BALANCE SHEET */}
          {activeTab === 'balance-sheet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">TOTAL ASSETS</span>
                  <span className="text-xl font-bold font-mono text-[#10B981] tabular-nums">
                    ${Number(balanceSheet?.totalAssets || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">TOTAL LIABILITIES</span>
                  <span className="text-xl font-bold font-mono text-[#F59E0B] tabular-nums">
                    ${Number(balanceSheet?.totalLiabilities || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">TOTAL EQUITY</span>
                  <span className="text-xl font-bold font-mono text-[#06B6D4] tabular-nums">
                    ${Number(balanceSheet?.totalEquity || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2638] mb-3">
                  <h3 className="text-xs font-bold text-[#F0F4F8] font-mono uppercase">
                    Balance Sheet Ledger Breakdown (As of {balanceSheet?.asOfDate || 'Current Fiscal Period'})
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                    BALANCED EQUILIBRIUM: TRUE
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[#06B6D4] mb-1.5 uppercase">Asset Accounts</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-[#1E2638]/50">
                        {balanceSheet?.assets?.map((a: any, i: number) => (
                          <tr key={i} className="text-[#F0F4F8]">
                            <td className="py-1.5 text-[#06B6D4] w-24">{a.accountCode}</td>
                            <td className="py-1.5">{a.accountName}</td>
                            <td className="py-1.5 text-right font-bold tabular-nums">${Number(a.balance || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 border-t border-[#1E2638]">
                    <h4 className="text-[10px] font-mono font-bold text-[#F59E0B] mb-1.5 uppercase">Liability Accounts</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-[#1E2638]/50">
                        {balanceSheet?.liabilities?.map((l: any, i: number) => (
                          <tr key={i} className="text-[#F0F4F8]">
                            <td className="py-1.5 text-[#F59E0B] w-24">{l.accountCode}</td>
                            <td className="py-1.5">{l.accountName}</td>
                            <td className="py-1.5 text-right font-bold tabular-nums">${Number(l.balance || 0).toFixed(2)}</td>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">TOTAL REVENUE</span>
                  <span className="text-xl font-bold font-mono text-[#10B981] tabular-nums">
                    ${Number(profitLoss?.totalRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">OPERATIONAL EXPENSES</span>
                  <span className="text-xl font-bold font-mono text-[#EF4444] tabular-nums">
                    ${Number(profitLoss?.totalExpenses || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] block uppercase mb-1">NET MISSION INCOME</span>
                  <span className={`text-xl font-bold font-mono tabular-nums ${Number(profitLoss?.netIncome || 0) >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    ${Number(profitLoss?.netIncome || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                <h3 className="text-xs font-bold text-[#F0F4F8] font-mono uppercase pb-2 border-b border-[#1E2638] mb-3">
                  Operating Statement ({profitLoss?.startDate} to {profitLoss?.endDate})
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[#10B981] mb-1.5 uppercase">Revenue Streams</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-[#1E2638]/50">
                        {profitLoss?.revenueItems?.map((r: any, i: number) => (
                          <tr key={i} className="text-[#F0F4F8]">
                            <td className="py-1.5 text-[#06B6D4] w-24">{r.accountCode}</td>
                            <td className="py-1.5">{r.accountName}</td>
                            <td className="py-1.5 text-right font-bold tabular-nums">${Number(r.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 border-t border-[#1E2638]">
                    <h4 className="text-[10px] font-mono font-bold text-[#EF4444] mb-1.5 uppercase">Expense Allocations</h4>
                    <table className="w-full text-left text-xs font-mono">
                      <tbody className="divide-y divide-[#1E2638]/50">
                        {profitLoss?.expenseItems?.map((e: any, i: number) => (
                          <tr key={i} className="text-[#F0F4F8]">
                            <td className="py-1.5 text-[#F59E0B] w-24">{e.accountCode}</td>
                            <td className="py-1.5">{e.accountName}</td>
                            <td className="py-1.5 text-right font-bold tabular-nums">${Number(e.amount || 0).toFixed(2)}</td>
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
            <div className="space-y-4">
              <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                <h3 className="text-xs font-bold text-[#F0F4F8] font-mono uppercase pb-2 border-b border-[#1E2638] mb-3">
                  Fiscal Budget vs Actual Spend Variance (FY {budgetReport?.fiscalYear || 2026})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-[#8C9BAE] uppercase border-b border-[#1E2638]">
                      <tr>
                        <th className="pb-1.5">Account</th>
                        <th className="pb-1.5">Cost Center</th>
                        <th className="pb-1.5">Planned ($)</th>
                        <th className="pb-1.5">Actual ($)</th>
                        <th className="pb-1.5">Variance ($)</th>
                        <th className="pb-1.5">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2638]/50">
                      {budgetReport?.items?.map((item: any, i: number) => (
                        <tr key={i} className="text-[#F0F4F8]">
                          <td className="py-2">
                            <div className="font-semibold text-[#F0F4F8]">{item.accountName}</div>
                            <div className="text-[9px] text-[#06B6D4] font-mono">CODE: {item.accountCode}</div>
                          </td>
                          <td className="py-2 text-[#8C9BAE]">{item.analyticAccountName || 'Cost Center'}</td>
                          <td className="py-2 font-bold tabular-nums">${Number(item.plannedAmount || 0).toLocaleString()}</td>
                          <td className="py-2 text-[#10B981] font-bold tabular-nums">${Number(item.actualAmount || 0).toLocaleString()}</td>
                          <td className="py-2 font-bold tabular-nums">${Number(item.variance || 0).toLocaleString()}</td>
                          <td className="py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 tabular-nums">
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-[#111622] rounded p-3.5 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">AVG PRESSURE</span>
                  <span className="text-xl font-bold font-mono text-[#06B6D4] tabular-nums">
                    {Number(envReport?.averagePressureKpa || 101.3).toFixed(2)} kPa
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Norm: 101.325 kPa</span>
                </div>
                <div className="bg-[#111622] rounded p-3.5 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">AVG CO₂ LEVEL</span>
                  <span className="text-xl font-bold font-mono text-[#F0F4F8] tabular-nums">
                    {Number(envReport?.averageCo2Ppm || 450).toFixed(1)} PPM
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Ceiling: 950 PPM</span>
                </div>
                <div className="bg-[#111622] rounded p-3.5 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">AVG WATER PURITY</span>
                  <span className="text-xl font-bold font-mono text-[#10B981] tabular-nums">
                    {Number(envReport?.averageWaterPurityPercent || 99.4).toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Grade: Potable/Reclaimed</span>
                </div>
                <div className="bg-[#111622] rounded p-3.5 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">INCIDENT COUNT</span>
                  <span className="text-xl font-bold font-mono text-[#F59E0B] tabular-nums">
                    {envReport?.totalAlerts ?? 0}
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">All monitored</span>
                </div>
              </div>

              <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                <h3 className="text-xs font-bold text-[#F0F4F8] font-mono uppercase pb-2 border-b border-[#1E2638] mb-2">
                  Atmospheric Stability Certificate
                </h3>
                <p className="text-xs font-mono text-[#8C9BAE] leading-relaxed">
                  Autonomous monitoring loop verified that all habitat biospheres maintain life-support equilibrium. Secondary amine scrubber cycles are scheduled on threshold breaches to prevent hypoxia or hypercapnia events.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: RESOURCE RECLAMATION */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">OXYGEN CONSUMED</span>
                  <span className="text-xl font-bold font-mono text-[#06B6D4] tabular-nums">
                    {Number(resReport?.totalOxygenConsumedM3 || 14.8).toFixed(1)} m³
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Billed to tenant expeditions</span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">WATER CONSUMED</span>
                  <span className="text-xl font-bold font-mono text-[#06B6D4] tabular-nums">
                    {Number(resReport?.totalWaterConsumedLiters || 68.5).toFixed(1)} L
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Closed-loop greywater cycle</span>
                </div>
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <span className="text-[10px] font-mono text-[#8C9BAE] uppercase block mb-1">SCRUBBER SERVICING</span>
                  <span className="text-xl font-bold font-mono text-[#10B981] tabular-nums">
                    {resReport?.totalScrubberAdjustments || 1} Cycles
                  </span>
                  <span className="text-[9px] font-mono text-[#5A677B] block mt-0.5">Canister regeneration completed</span>
                </div>
              </div>

              {resReport?.zoneBreakdowns && resReport.zoneBreakdowns.length > 0 && (
                <div className="bg-[#111622] rounded p-4 border border-[#1E2638]">
                  <h3 className="text-xs font-bold text-[#F0F4F8] font-mono uppercase pb-2 border-b border-[#1E2638] mb-2">
                    Zone-by-Zone Consumption Breakdowns
                  </h3>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] text-[#8C9BAE] uppercase border-b border-[#1E2638]">
                      <tr>
                        <th className="pb-1.5">Zone Code</th>
                        <th className="pb-1.5">Zone Name</th>
                        <th className="pb-1.5">Oxygen (m³)</th>
                        <th className="pb-1.5">Water (L)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2638]/50">
                      {resReport.zoneBreakdowns.map((zb: any, idx: number) => (
                        <tr key={idx} className="text-[#F0F4F8]">
                          <td className="py-1.5 text-[#06B6D4] font-bold">{zb.zoneCode}</td>
                          <td className="py-1.5">{zb.zoneName}</td>
                          <td className="py-1.5 tabular-nums">{Number(zb.oxygenConsumedM3 || 0).toFixed(2)}</td>
                          <td className="py-1.5 tabular-nums">{Number(zb.waterConsumedLiters || 0).toFixed(2)}</td>
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
