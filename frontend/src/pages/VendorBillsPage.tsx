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
  const [refreshing, setRefreshing] = useState(false);

  const fetchBills = async () => {
    try {
      const records = await api.vendorBills.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const columns: Column<T.VendorBill>[] = [
    {
      header: 'BILL NUMBER',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.billNumber}
        </span>
      ),
      accessorKey: 'billNumber',
    },
    {
      header: 'VENDOR CREDITOR',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.vendor?.name || 'Orbital Equipment Supplies'}
        </span>
      ),
    },
    {
      header: 'BILL DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.billDate || '2026-09-18'}
        </span>
      ),
      accessorKey: 'billDate',
    },
    {
      header: 'DUE DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.dueDate || '2026-10-18'}
        </span>
      ),
      accessorKey: 'dueDate',
    },
    {
      header: 'BILL TOTAL',
      render: r => (
        <span className="font-bold text-[#F1F4F6] tabular-nums">
          ₹{Number(r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'total',
    },
    {
      header: 'PAID AMOUNT',
      render: r => (
        <span className="font-bold text-[#10B981] tabular-nums">
          ₹{Number(r.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'paidAmount',
    },
    {
      header: 'BALANCE DUE',
      render: r => {
        const bal = Number(r.balanceDue || 0);
        return (
          <span className={`font-bold tabular-nums ${bal > 0 ? 'text-[#F59E0B]' : 'text-[#657184]'}`}>
            ₹{bal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
      align: 'right',
      accessorKey: 'balanceDue',
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'PAID'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="VENDOR INVOICES & BILLS"
        subtitle="ACCOUNTS PAYABLE // REAGENT SUPPLIERS, MEMBRANE RESTOCK & CONTRACTOR OBLIGATIONS"
        icon={Receipt}
        badge="ACCOUNTS PAYABLE"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchBills();
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
        emptyMessage="NO VENDOR BILLS ON RECORD"
        searchable
        searchPlaceholder="SEARCH VENDOR BILLS (BILL #, VENDOR)..."
        pageSize={20}
      />
    </div>
  );
};
