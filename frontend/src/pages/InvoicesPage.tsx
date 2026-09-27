import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FileCheck, RefreshCw } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [data, setData] = useState<T.Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const records = await api.invoices.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const columns: Column<T.Invoice>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      className: 'font-bold text-cyan-400',
    },
    {
      header: 'Customer Entity',
      render: (r) => r.customer?.name || 'Customer Debtor',
    },
    {
      header: 'Invoice Date',
      accessorKey: 'invoiceDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Invoice Total',
      render: (r) => (
        <span className="font-bold text-white">
          ${Number(r.total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      render: (r) => (
        <span className="text-emerald-400 font-semibold">
          ${Number(r.paidAmount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Balance Due',
      render: (r) => (
        <span className={Number(r.balanceDue || 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
          ${Number(r.balanceDue || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Billing Status',
      render: (r) => <StatusBadge status={r.status || 'POSTED'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices & Consumption Billing"
        subtitle="Accounts Receivable generated from metered oxygen usage, habitat residency, and scrubber servicing"
        icon={FileCheck}
        badge="ACCOUNTS RECEIVABLE"
        actions={
          <button
            onClick={fetchInvoices}
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
        emptyMessage="No customer invoices found."
      />
    </div>
  );
};
