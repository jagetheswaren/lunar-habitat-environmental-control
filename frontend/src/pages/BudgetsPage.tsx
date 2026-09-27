import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Calculator, RefreshCw } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const [data, setData] = useState<T.Budget[]>([]);
  const [variance, setVariance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const [bList, vData] = await Promise.all([
        api.budgets.getAll(),
        api.budgets.getVariance(2026).catch(() => null),
      ]);
      setData(bList);
      setVariance(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const columns: Column<T.Budget>[] = [
    {
      header: 'Budget Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Fiscal Year',
      accessorKey: 'fiscalYear',
      className: 'font-mono text-cyan-400 font-bold',
    },
    {
      header: 'Planned Expenditure',
      render: (r) => `$${Number(r.totalPlannedAmount || 0).toLocaleString()}`,
    },
    {
      header: 'Actual Consumed Spend',
      render: (r) => (
        <span className="text-emerald-400 font-semibold font-mono">
          ${Number(r.totalActualAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Remaining Headroom',
      render: (r) => {
        const remaining = Number(r.totalPlannedAmount || 0) - Number(r.totalActualAmount || 0);
        return (
          <span className="font-mono text-white">
            ${remaining.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'CONFIRMED'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal Budgets & Allocations"
        subtitle="Annual operating budgets for environmental maintenance, atmospheric scrubbers, and habitat expansion"
        icon={Calculator}
        badge="FY 2026 ACTIVE"
        actions={
          <button
            onClick={fetchBudgets}
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
        emptyMessage="No fiscal budgets defined."
      />
    </div>
  );
};
