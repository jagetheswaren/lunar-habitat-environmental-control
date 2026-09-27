import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

export const JournalEntriesPage: React.FC = () => {
  const [data, setData] = useState<T.JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const records = await api.journals.getEntries();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const columns: Column<T.JournalEntry>[] = [
    {
      header: 'Entry Number',
      accessorKey: 'entryNumber',
      className: 'font-bold text-cyan-400 font-mono',
    },
    {
      header: 'Source Origin',
      render: (r) => (
        <span className="text-slate-300 font-mono text-xs">
          {r.referenceType || 'GENERAL_JOURNAL'}
        </span>
      ),
    },
    {
      header: 'Entry Date',
      accessorKey: 'entryDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Total Debit ($)',
      render: (r) => (
        <span className="font-mono font-semibold text-white">
          ${Number(r.totalDebit || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Total Credit ($)',
      render: (r) => (
        <span className="font-mono font-semibold text-white">
          ${Number(r.totalCredit || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Balance Check',
      render: (r) => {
        const isBalanced = Number(r.totalDebit) === Number(r.totalCredit);
        return isBalanced ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> BALANCED (Δ 0.00)
          </span>
        ) : (
          <span className="text-[11px] font-mono text-red-400">OUT OF BALANCE</span>
        );
      },
    },
    {
      header: 'GL Status',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {r.status || 'POSTED'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Ledger Journal Entries"
        subtitle="Immutable double-entry book entries verifying absolute mathematical equality of debits and credits"
        icon={FileText}
        badge="STRICT EQUILIBRIUM"
        actions={
          <button
            onClick={fetchEntries}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 bg-space-850 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No general ledger journal entries found."
      />
    </div>
  );
};
