import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CreditCard, RefreshCw } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [data, setData] = useState<T.Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const records = await api.payments.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns: Column<T.Payment>[] = [
    {
      header: 'Payment #',
      accessorKey: 'paymentNumber',
      className: 'font-bold text-cyan-400',
    },
    {
      header: 'Party Entity',
      render: (r) => r.contact?.name || 'Partner Account',
    },
    {
      header: 'Payment Type',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
            r.type === 'CUSTOMER_PAYMENT'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      header: 'Amount ($)',
      render: (r) => (
        <span className="font-bold text-white">
          ${Number(r.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      className: 'text-slate-300 text-xs',
    },
    {
      header: 'Tx Date',
      accessorKey: 'paymentDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Settlement Status',
      render: (r) => <StatusBadge status={r.status || 'RECORDED'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions & Settlements"
        subtitle="Disbursements to vendors and cash receipts from tenant expeditions with automatic GL journal posting"
        icon={CreditCard}
        badge="CASH SETTLEMENT"
        actions={
          <button
            onClick={fetchPayments}
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
        emptyMessage="No payment records registered."
      />
    </div>
  );
};
