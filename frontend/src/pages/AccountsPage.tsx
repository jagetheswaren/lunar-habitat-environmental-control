import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { BookOpen, RefreshCw } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [data, setData] = useState<T.Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const records = await api.accounts.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const columns: Column<T.Account>[] = [
    {
      header: 'Account Code',
      accessorKey: 'code',
      className: 'font-bold text-cyan-400 font-mono w-28',
    },
    {
      header: 'Account Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Classification',
      render: (r) => {
        const typeColors: Record<string, string> = {
          ASSET: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40',
          LIABILITY: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40',
          EQUITY: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40',
          REVENUE: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40',
          EXPENSE: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${typeColors[r.type] || 'bg-slate-800'}`}>
            {r.type}
          </span>
        );
      },
    },
    {
      header: 'Current Ledger Balance',
      render: (r) => (
        <span className="font-bold font-mono text-white">
          ${Number(r.balance || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts (COA)"
        subtitle="Standard double-entry chart of accounts covering lunar infrastructure assets, liabilities, and cost structures"
        icon={BookOpen}
        badge="DOUBLE-ENTRY"
        actions={
          <button
            onClick={fetchAccounts}
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
        emptyMessage="No accounts seeded in Chart of Accounts."
      />
    </div>
  );
};
