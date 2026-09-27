import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Boxes, RefreshCw, AlertCircle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [data, setData] = useState<T.InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const records = await api.inventory.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns: Column<T.InventoryItem>[] = [
    {
      header: 'Stock Item',
      render: (r) => (
        <div>
          <div className="font-semibold text-white">{r.product?.name || 'Resource Consumable'}</div>
          <div className="text-[10px] text-cyan-400 font-mono">SKU: {r.product?.sku || 'SKU-LUN'}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (r) => <span className="text-slate-300">{r.product?.category || 'CONSUMABLE'}</span>,
    },
    {
      header: 'Quantity on Hand',
      render: (r) => {
        const isLow = Number(r.quantityOnHand) <= Number(r.safetyStockLevel);
        return (
          <span className={`font-bold font-mono ${isLow ? 'text-amber-400 flex items-center gap-1' : 'text-emerald-400'}`}>
            {isLow && <AlertCircle className="w-3.5 h-3.5" />}
            {Number(r.quantityOnHand).toFixed(1)} {r.unit || r.product?.unitOfMeasure || 'units'}
          </span>
        );
      },
    },
    {
      header: 'Safety Stock',
      render: (r) => `${r.safetyStockLevel} ${r.unit || 'units'}`,
    },
    {
      header: 'Reorder Point',
      render: (r) => `${r.reorderPoint} ${r.unit || 'units'}`,
    },
    {
      header: 'Storage Location',
      accessorKey: 'location',
      className: 'text-slate-400',
    },
    {
      header: 'Last Audit Update',
      accessorKey: 'lastUpdated',
      className: 'text-slate-400 text-[11px]',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Inventory & Buffers"
        subtitle="Critical consumable buffers, oxygen tanks, water reclamation reservoirs, and CO₂ filters"
        icon={Boxes}
        badge="INVENTORY LEDGER"
        actions={
          <button
            onClick={fetchInventory}
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
        emptyMessage="No stock items registered in inventory."
      />
    </div>
  );
};
