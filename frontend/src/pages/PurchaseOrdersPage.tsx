import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ShoppingBag, RefreshCw } from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const [data, setData] = useState<T.PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const records = await api.purchaseOrders.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: Column<T.PurchaseOrder>[] = [
    {
      header: 'PO Number',
      accessorKey: 'poNumber',
      className: 'font-bold text-cyan-400',
    },
    {
      header: 'Vendor Supplier',
      render: (r) => r.vendor?.name || 'Orbital Reclamation Technologies',
    },
    {
      header: 'Order Date',
      accessorKey: 'orderDate',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Line Items',
      render: (r) => `${r.lines?.length || 1} line item(s)`,
    },
    {
      header: 'Total Value',
      render: (r) => (
        <span className="font-bold text-white">
          ${Number(r.total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Lifecycle Status',
      render: (r) => <StatusBadge status={r.status || 'CONFIRMED'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement Purchase Orders"
        subtitle="Upstream supply requisitions for atmosphere filters, mineral buffer tanks, and scrubbers"
        icon={ShoppingBag}
        badge="SUPPLY CHAIN"
        actions={
          <button
            onClick={fetchOrders}
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
        emptyMessage="No procurement purchase orders found."
      />
    </div>
  );
};
