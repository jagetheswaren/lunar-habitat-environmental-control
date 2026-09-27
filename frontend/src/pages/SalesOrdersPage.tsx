import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';

export const SalesOrdersPage: React.FC = () => {
  const [data, setData] = useState<T.SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const records = await api.salesOrders.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: Column<T.SalesOrder>[] = [
    {
      header: 'ORDER NUMBER',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.orderNumber}
        </span>
      ),
      accessorKey: 'orderNumber',
    },
    {
      header: 'CUSTOMER / TENANT',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.customer?.name || 'Axiom Lunar Consortium'}
        </span>
      ),
    },
    {
      header: 'ORDER DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.orderDate || '2026-09-21'}
        </span>
      ),
      accessorKey: 'orderDate',
    },
    {
      header: 'LINE ITEMS',
      render: r => (
        <span className="text-[#98A3B3]">
          {r.lines?.length || 2} line item(s)
        </span>
      ),
    },
    {
      header: 'ORDER TOTAL',
      render: r => (
        <span className="font-bold text-[#10B981] tabular-nums">
          ₹{Number(r.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'total',
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'CONFIRMED'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="COMMERCIAL SALES ORDERS"
        subtitle="RESOURCE ALLOCATIONS // HABITAT LEASE CONTRACTS & METERED GAS DELIVERIES"
        icon={FileSpreadsheet}
        badge="COMMERCIAL CONTRACTS"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
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
        emptyMessage="NO COMMERCIAL SALES ORDERS FOUND"
        searchable
        searchPlaceholder="SEARCH SALES ORDERS (ORDER #, TENANT)..."
        pageSize={20}
      />
    </div>
  );
};
