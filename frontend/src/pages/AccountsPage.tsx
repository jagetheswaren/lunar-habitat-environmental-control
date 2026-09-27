import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BookOpen, RefreshCw, ChevronDown, ChevronRight, ChevronsUpDown, ShieldCheck } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [data, setData] = useState<T.Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '1000 ASSETS': true,
    '2000 LIABILITIES': true,
    '3000 EQUITY': true,
    '4000 REVENUE': true,
    '5000 EXPENSES': true,
  });

  const fetchAccounts = async () => {
    try {
      const records = await api.accounts.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Group accounts by major code prefix / classification
  const groupedAccounts = useMemo(() => {
    const groups: Record<
      string,
      { code: string; name: string; accounts: T.Account[]; totalBalance: number }
    > = {
      '1000 ASSETS': { code: '1000', name: 'ASSETS', accounts: [], totalBalance: 0 },
      '2000 LIABILITIES': { code: '2000', name: 'LIABILITIES', accounts: [], totalBalance: 0 },
      '3000 EQUITY': { code: '3000', name: 'EQUITY', accounts: [], totalBalance: 0 },
      '4000 REVENUE': { code: '4000', name: 'REVENUE', accounts: [], totalBalance: 0 },
      '5000 EXPENSES': { code: '5000', name: 'EXPENSES', accounts: [], totalBalance: 0 },
    };

    data.forEach(acc => {
      const codeStr = String(acc.code || '');
      let groupKey = '1000 ASSETS';

      if (codeStr.startsWith('1') || acc.type === 'ASSET') groupKey = '1000 ASSETS';
      else if (codeStr.startsWith('2') || acc.type === 'LIABILITY') groupKey = '2000 LIABILITIES';
      else if (codeStr.startsWith('3') || acc.type === 'EQUITY') groupKey = '3000 EQUITY';
      else if (codeStr.startsWith('4') || acc.type === 'REVENUE') groupKey = '4000 REVENUE';
      else if (codeStr.startsWith('5') || acc.type === 'EXPENSE') groupKey = '5000 EXPENSES';

      groups[groupKey].accounts.push(acc);
      groups[groupKey].totalBalance += Number(acc.balance || 0);
    });

    return groups;
  }, [data]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const allOpen = Object.values(expandedGroups).every(v => v);
    const nextState: Record<string, boolean> = {};
    Object.keys(groupedAccounts).forEach(k => {
      nextState[k] = !allOpen;
    });
    setExpandedGroups(nextState);
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="CHART OF ACCOUNTS (COA)"
        subtitle="HIERARCHICAL DOUBLE-ENTRY ACCOUNT TREE // INFRASTRUCTURE CAPITAL, BALANCES & LEDGERS"
        icon={BookOpen}
        badge="DOUBLE-ENTRY HIERARCHY"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              EXPAND / COLLAPSE ALL
            </button>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchAccounts();
              }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        }
      />

      {/* Hierarchical Tree / Table */}
      <div className="bg-[#111820] border border-[#283443] rounded overflow-hidden">
        <div className="p-2.5 bg-[#0C1118] border-b border-[#283443] grid grid-cols-12 text-[10px] text-[#657184] uppercase font-bold tracking-wider">
          <div className="col-span-4">ACCOUNT CODE & TITLE</div>
          <div className="col-span-3">CLASSIFICATION</div>
          <div className="col-span-3 text-right">LEDGER BALANCE</div>
          <div className="col-span-2 text-right">STATUS</div>
        </div>

        <div className="divide-y divide-[#283443]/60">
          {Object.entries(groupedAccounts).map(([groupKey, group]) => {
            const isExpanded = !!expandedGroups[groupKey];

            return (
              <div key={groupKey} className="bg-[#111820]">
                {/* Group Header Row */}
                <div
                  onClick={() => toggleGroup(groupKey)}
                  className="p-3 bg-[#161F2A]/60 hover:bg-[#161F2A] cursor-pointer flex items-center justify-between transition-colors border-b border-[#283443]/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#06B6D4]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <span className="font-bold text-[#F1F4F6] text-xs uppercase tracking-wider">
                      {groupKey}
                    </span>
                    <span className="text-[10px] text-[#657184]">
                      ({group.accounts.length} sub-accounts)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#657184] uppercase">GROUP TOTAL:</span>
                    <span className="text-xs font-bold text-[#F1F4F6] tabular-nums">
                      ₹{group.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Sub-account rows */}
                {isExpanded && (
                  <div className="divide-y divide-[#283443]/30 bg-[#0C1118]/50">
                    {group.accounts.length === 0 ? (
                      <div className="p-3 pl-10 text-[11px] text-[#657184]">
                        NO SUB-ACCOUNTS CURRENTLY SEEDED UNDER THIS GROUP
                      </div>
                    ) : (
                      group.accounts.map(acc => (
                        <div
                          key={acc.id}
                          className="p-2.5 pl-9 hover:bg-[#161F2A]/40 grid grid-cols-12 items-center transition-colors text-[11px]"
                        >
                          <div className="col-span-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                            <span className="font-bold text-[#06B6D4] w-14 tabular-nums">{acc.code}</span>
                            <span className="text-[#F1F4F6] font-semibold">{acc.name}</span>
                          </div>

                          <div className="col-span-3">
                            <span className="text-[10px] text-[#98A3B3] uppercase">
                              {acc.type}
                            </span>
                          </div>

                          <div className="col-span-3 text-right">
                            <span className="font-bold tabular-nums text-[#F1F4F6]">
                              ₹{Number(acc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="col-span-2 text-right">
                            <StatusBadge status="ACTIVE" size="sm" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
