import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { PieChart, RefreshCw } from 'lucide-react';

export const AnalyticAccountsPage: React.FC = () => {
  const [data, setData] = useState<T.AnalyticAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const records = await api.budgets.getAnalyticAccounts();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const columns: Column<T.AnalyticAccount>[] = [
    {
      header: 'Analytic Code',
      accessorKey: 'code',
      className: 'font-bold text-cyan-400 font-mono w-28',
    },
    {
      header: 'Cost Center Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Description',
      accessorKey: 'description',
      className: 'text-slate-400 text-xs max-w-sm',
    },
    {
      header: 'Allocated Budget',
      render: (r) => `$${Number(r.budgetAllocated || 100000).toLocaleString()}`,
    },
    {
      header: 'Actual Incurred Spend',
      render: (r) => (
        <span className="text-emerald-400 font-semibold font-mono">
          ${Number(r.totalActualSpend || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Tracking Status',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost Centers & Analytic Accounts"
        subtitle="Multi-dimensional cost tracking per habitat dome, water loop, life support array, and expedition module"
        icon={PieChart}
        badge="ANALYTIC ACCOUNTING"
        actions={
          <button
            onClick={fetchAnalytics}
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
        emptyMessage="No analytic cost centers found."
      />
    </div>
  );
};
