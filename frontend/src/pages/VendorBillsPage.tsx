import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Receipt, RefreshCw } from 'lucide-react';

export const VendorBillsPage: React.FC = () => {
  const [data, setData] = useState<T.VendorBill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const records = await api.vendorBills.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const columns: Column<T.VendorBill>[] = [
    {
      header: 'Bill Number',
      accessorKey: 'billNumber',
      className: 'font-bold text-cyan-400',
    },
    {
      header: 'Vendor Creditor',
      render: (r) => r.vendor?.name || 'Vendor Entity',
    },
    {
      header: 'Bill Date',
      accessorKey: 'billDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Bill Total',
      render: (r) => `$${Number(r.total || 0).toFixed(2)}`,
    },
    {
      header: 'Paid Amount',
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
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'PAID'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Invoices & Bills"
        subtitle="Accounts Payable obligations to external contractors, parts suppliers, and reclamation vendors"
        icon={Receipt}
        badge="ACCOUNTS PAYABLE"
        actions={
          <button
            onClick={fetchBills}
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
        emptyMessage="No vendor bills found in database."
      />
    </div>
  );
};
