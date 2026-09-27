import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { Boxes, RefreshCw, AlertTriangle, CheckCircle2, Box } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [data, setData] = useState<T.InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<T.InventoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      const records = await api.inventory.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(data.map(i => i.product?.category || 'RESOURCE').filter(Boolean)))];

  const filtered = data.filter(item => {
    if (categoryFilter === 'ALL') return true;
    return item.product?.category === categoryFilter;
  });

  const columns: Column<T.InventoryItem>[] = [
    {
      header: 'ITEM',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.product?.name || 'Resource Consumable'}
        </span>
      ),
    },
    {
      header: 'CODE',
      render: r => (
        <span className="text-[#06B6D4] font-bold">
          {r.product?.sku || `RES-${r.id}`}
        </span>
      ),
    },
    {
      header: 'CATEGORY',
      render: r => (
        <span className="text-[#98A3B3] uppercase text-[10px]">
          {r.product?.category || 'RESOURCE'}
        </span>
      ),
    },
    {
      header: 'AVAILABLE',
      render: r => {
        const q = Number(r.quantityOnHand || 0);
        const s = Number(r.safetyStockLevel || 0);
        const isLow = q <= s;
        return (
          <span className={`font-bold tabular-nums ${isLow ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
            {q.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        );
      },
      align: 'right',
      accessorKey: 'quantityOnHand',
    },
    {
      header: 'MIN',
      render: r => (
        <span className="text-[#657184] tabular-nums">
          {Number(r.safetyStockLevel || 0).toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'REORDER',
      render: r => (
        <span className="text-[#F59E0B] tabular-nums">
          {Number(r.reorderPoint || (Number(r.safetyStockLevel || 0) * 1.5)).toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'MAX',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {Number(r.safetyStockLevel ? Number(r.safetyStockLevel) * 3 : 5000).toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'UNIT',
      render: r => (
        <span className="text-[#657184] uppercase">
          {r.unit || r.product?.unitOfMeasure || 'L'}
        </span>
      ),
    },
    {
      header: 'LOCATION',
      render: r => (
        <span className="text-[#98A3B3]">
          {r.location || 'STOR-SILO-01'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      render: r => {
        const q = Number(r.quantityOnHand || 0);
        const s = Number(r.safetyStockLevel || 0);
        const status = q <= s ? 'LOW_STOCK' : 'NOMINAL';
        return <StatusBadge status={status} size="sm" />;
      },
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="RESOURCE BUFFER & INVENTORY STOCKS"
        subtitle="TABLE-FIRST INVENTORY CONTROL // CRITICAL CONSUMABLES & BUFFER THRESHOLDS"
        icon={Boxes}
        badge="SCADA ERP"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchInventory();
              }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        }
      />

      {/* Category Filter Strip */}
      <div className="flex items-center gap-1.5 p-1 bg-[#111820] border border-[#283443] rounded w-fit text-[11px]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded font-bold uppercase transition-colors ${
              categoryFilter === cat
                ? 'bg-[#161F2A] border border-[#06B6D4] text-[#06B6D4]'
                : 'text-[#98A3B3] hover:text-[#F1F4F6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table-First Design */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="NO INVENTORY ITEMS MATCHING CURRENT QUERY"
        searchable
        searchPlaceholder="SEARCH ITEMS (NAME, SKU, LOCATION)..."
        onRowClick={row => {
          setSelectedItem(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedItem?.id}
        pageSize={25}
      />

      {/* Item Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem?.product?.name || 'INVENTORY ITEM'}
        subtitle={`SKU: ${selectedItem?.product?.sku || 'SKU-001'} // LOCATION: ${selectedItem?.location || 'SILO-01'}`}
        badge={Number(selectedItem?.quantityOnHand || 0) <= Number(selectedItem?.safetyStockLevel || 0) ? 'LOW' : 'NOMINAL'}
        badgeType={Number(selectedItem?.quantityOnHand || 0) <= Number(selectedItem?.safetyStockLevel || 0) ? 'warning' : 'nominal'}
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">RECORD ID: #{selectedItem?.id}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                STOCK RESERVES SPECIFICATION
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] block">QUANTITY AVAILABLE</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">
                    {Number(selectedItem.quantityOnHand).toLocaleString()} {selectedItem.unit || 'L'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">MINIMUM SAFETY STOCK</span>
                  <span className="font-bold text-[#F59E0B] tabular-nums">
                    {Number(selectedItem.safetyStockLevel).toLocaleString()} {selectedItem.unit || 'L'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">REORDER THRESHOLD</span>
                  <span className="font-bold text-[#06B6D4] tabular-nums">
                    {Number(selectedItem.reorderPoint).toLocaleString()} {selectedItem.unit || 'L'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">STORAGE LOCATION</span>
                  <span className="font-bold text-[#F1F4F6]">{selectedItem.location || 'SILO-01'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1.5">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                COMMODITY DESCRIPTION
              </span>
              <p className="text-[11px] text-[#98A3B3]">
                {(selectedItem.product as any)?.description ||
                  'Critical lunar life-support and habitat consumable maintained under automated replenishment thresholds.'}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
