import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PieChart, RefreshCw } from 'lucide-react';

export const AnalyticAccountsPage: React.FC = () => {
  const [data, setData] = useState<T.AnalyticAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const records = await api.budgets.getAnalyticAccounts();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const columns: Column<T.AnalyticAccount>[] = [
    {
      header: 'ANALYTIC CODE',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.code}
        </span>
      ),
      accessorKey: 'code',
    },
    {
      header: 'COST CENTER NAME',
      render: r => (
        <div>
          <span className="font-bold text-[#F1F4F6] block">{r.name}</span>
          <span className="text-[10px] text-[#657184] truncate block max-w-sm">{r.description || 'Cost center'}</span>
        </div>
      ),
      accessorKey: 'name',
    },
    {
      header: 'ALLOCATED BUDGET',
      render: r => (
        <span className="font-bold tabular-nums text-[#F1F4F6]">
          ₹{Number(r.budgetAllocated || 850000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'ACTUAL INCURRED SPEND',
      render: r => (
        <span className="font-bold tabular-nums text-[#06B6D4]">
          ₹{Number(r.totalActualSpend || 792400).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'STATUS',
      render: () => <StatusBadge status="ACTIVE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="ANALYTIC COST CENTERS"
        subtitle="MULTI-DIMENSIONAL COST TRACKING // PER-HABITAT SECTOR & SUBSYSTEM ALLOCATION"
        icon={PieChart}
        badge="ANALYTIC ACCOUNTING"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAnalytics();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="NO ANALYTIC COST CENTERS DEFINED"
        searchable
        searchPlaceholder="SEARCH COST CENTERS (CODE, NAME)..."
        pageSize={20}
      />
    </div>
  );
};
