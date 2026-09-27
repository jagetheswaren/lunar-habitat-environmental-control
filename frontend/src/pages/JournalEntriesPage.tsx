import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FileText, RefreshCw, CheckCircle2, Filter, Search, ShieldCheck } from 'lucide-react';

export const JournalEntriesPage: React.FC = () => {
  const [data, setData] = useState<T.JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<'ALL' | '7D' | '30D' | 'SOL-187'>('ALL');
  const [journalFilter, setJournalFilter] = useState<string>('ALL');
  const [refQuery, setRefQuery] = useState<string>('');

  const fetchEntries = async () => {
    try {
      const records = await api.journals.getEntries();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filtered entries
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (journalFilter !== 'ALL' && item.referenceType !== journalFilter) return false;
      if (refQuery.trim()) {
        const q = refQuery.toLowerCase();
        const matchesRef = item.referenceId?.toLowerCase().includes(q) || item.entryNumber?.toLowerCase().includes(q);
        if (!matchesRef) return false;
      }
      return true;
    });
  }, [data, journalFilter, refQuery]);

  // Total debits / credits
  const { totalDebits, totalCredits } = useMemo(() => {
    let d = 0;
    let c = 0;
    filteredData.forEach(item => {
      d += Number(item.totalDebit || 0);
      c += Number(item.totalCredit || 0);
    });
    return { totalDebits: d, totalCredits: c };
  }, [filteredData]);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Flattened entries for maximum density if lines exist, or high density entry rows
  const columns: Column<T.JournalEntry>[] = [
    {
      header: 'DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.entryDate || '2026-09-24'}
        </span>
      ),
      accessorKey: 'entryDate',
    },
    {
      header: 'ENTRY',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.entryNumber}
        </span>
      ),
      accessorKey: 'entryNumber',
    },
    {
      header: 'JOURNAL',
      render: r => (
        <span className="text-[#98A3B3] uppercase text-[10px]">
          {r.referenceType || 'GENERAL_JOURNAL'}
        </span>
      ),
      accessorKey: 'referenceType',
    },
    {
      header: 'ACCOUNT',
      render: r => {
        const desc = (r as any).accountName || '1100 CASH ON HAND / HABITAT REVENUE';
        return <span className="text-[#F1F4F6] font-semibold">{desc}</span>;
      },
    },
    {
      header: 'DESCRIPTION',
      render: r => {
        const desc = (r as any).description || `Settlement batch for ${r.entryNumber}`;
        return <span className="text-[#98A3B3] truncate block max-w-xs">{desc}</span>;
      },
    },
    {
      header: 'DEBIT',
      render: r => (
        <span className="font-bold tabular-nums text-[#F1F4F6]">
          ₹{Number(r.totalDebit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'totalDebit',
    },
    {
      header: 'CREDIT',
      render: r => (
        <span className="font-bold tabular-nums text-[#F1F4F6]">
          ₹{Number(r.totalCredit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'totalCredit',
    },
    {
      header: 'REFERENCE',
      render: r => (
        <span className="text-[#657184] font-semibold">
          {r.referenceId || `TX-${r.id}`}
        </span>
      ),
      accessorKey: 'referenceId',
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="GENERAL LEDGER (DOUBLE-ENTRY)"
        subtitle="DENSE DOUBLE-ENTRY GENERAL LEDGER // ABSOLUTE EQUILIBRIUM AUDIT OF DEBITS AND CREDITS"
        icon={FileText}
        badge="LEDGER SYNC"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchEntries();
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

      {/* Dense Filter Bar */}
      <div className="p-2.5 bg-[#111820] border border-[#283443] rounded flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#657184] uppercase font-bold">JOURNAL:</span>
            <select
              value={journalFilter}
              onChange={e => setJournalFilter(e.target.value)}
              className="bg-[#161F2A] border border-[#283443] rounded px-2 py-0.5 text-xs text-[#F1F4F6] outline-none"
            >
              <option value="ALL">ALL JOURNALS</option>
              <option value="GENERAL_JOURNAL">GENERAL JOURNAL</option>
              <option value="REVENUE_JOURNAL">REVENUE JOURNAL</option>
              <option value="PURCHASE_JOURNAL">PURCHASE JOURNAL</option>
              <option value="BANK_JOURNAL">BANK JOURNAL</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#657184] uppercase font-bold">DATE RANGE:</span>
            {(['ALL', '7D', '30D', 'SOL-187'] as const).map(df => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-colors border ${
                  dateFilter === df
                    ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                    : 'bg-[#0C1118] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
                }`}
              >
                {df}
              </button>
            ))}
          </div>
        </div>

        {/* Grand Total Strip */}
        <div className="flex items-center gap-4 text-[11px]">
          <div>
            <span className="text-[#657184] mr-1">TOTAL DEBITS:</span>
            <strong className="text-[#F1F4F6] tabular-nums">
              ₹{totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div>
            <span className="text-[#657184] mr-1">TOTAL CREDITS:</span>
            <strong className="text-[#F1F4F6] tabular-nums">
              ₹{totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
              isBalanced
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
            }`}
          >
            {isBalanced ? 'BALANCED (Δ 0.00)' : 'OUT OF BALANCE'}
          </span>
        </div>
      </div>

      {/* Dense General Ledger Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="NO GENERAL LEDGER ENTRIES REGISTERED"
        searchable
        searchPlaceholder="SEARCH GENERAL LEDGER (ENTRY, ACCOUNT, REFERENCE)..."
        pageSize={30}
        stickyHeader
      />
    </div>
  );
};
