import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Boxes, RefreshCw, AlertCircle, Search, Filter } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [data, setData] = useState<T.InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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

  const categories = ['ALL', ...Array.from(new Set(data.map(i => i.product?.category || 'CONSUMABLE').filter(Boolean)))];

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.product?.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = data.filter(r => Number(r.quantityOnHand) <= Number(r.safetyStockLevel)).length;

  const columns: Column<T.InventoryItem>[] = [
    {
      header: 'Stock Item & SKU',
      render: (r) => (
        <div>
          <div className="font-semibold text-[#F0F4F8]">{r.product?.name || 'Resource Consumable'}</div>
          <div className="text-[10px] text-[#06B6D4] font-mono">SKU: {r.product?.sku || 'SKU-LUN'}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (r) => <span className="text-[#8C9BAE] text-[11px] uppercase">{r.product?.category || 'CONSUMABLE'}</span>,
    },
    {
      header: 'Quantity on Hand',
      render: (r) => {
        const q = Number(r.quantityOnHand || 0);
        const s = Number(r.safetyStockLevel || 0);
        const isLow = q <= s;
        const pct = s > 0 ? Math.min(100, Math.round((q / (s * 2)) * 100)) : 100;
        return (
          <div className="space-y-1">
            <span className={`font-bold font-mono tabular-nums flex items-center gap-1 ${isLow ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {isLow && <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />}
              {q.toFixed(1)} {r.unit || r.product?.unitOfMeasure || 'units'}
            </span>
            <div className="w-24 bg-[#0B0E14] h-1 rounded overflow-hidden">
              <div
                className={`h-1 ${isLow ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Safety Stock',
      render: (r) => (
        <span className="tabular-nums text-[#8C9BAE]">
          {r.safetyStockLevel} {r.unit || 'units'}
        </span>
      ),
    },
    {
      header: 'Reorder Point',
      render: (r) => (
        <span className="tabular-nums text-[#8C9BAE]">
          {r.reorderPoint} {r.unit || 'units'}
        </span>
      ),
    },
    {
      header: 'Storage Location',
      accessorKey: 'location',
      className: 'text-[#8C9BAE] text-[11px]',
    },
    {
      header: 'Last Audit Update (UTC)',
      accessorKey: 'lastUpdated',
      className: 'text-[#5A677B] text-[11px] tabular-nums',
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Resource Inventory & Reserves"
        subtitle="Critical consumable buffers, oxygen cylinders, water reserves, and scrubber chemical cartridges"
        icon={Boxes}
        badge="LOGISTICS BUFFER"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchInventory();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638]">
          <span className="text-[10px] text-[#8C9BAE] uppercase block">Total Catalog Items</span>
          <span className="text-xl font-bold text-[#F0F4F8] tabular-nums">{data.length}</span>
        </div>
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638]">
          <span className="text-[10px] text-[#8C9BAE] uppercase block">Safe Reserve Items</span>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{data.length - lowStockCount}</span>
        </div>
        <div className={`p-3 rounded border ${
          lowStockCount > 0 ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]' : 'bg-[#111622] border-[#1E2638] text-[#8C9BAE]'
        }`}>
          <span className="text-[10px] uppercase block">Low Stock Warnings</span>
          <span className="text-xl font-bold tabular-nums">{lowStockCount}</span>
        </div>
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638]">
          <span className="text-[10px] text-[#8C9BAE] uppercase block">Logistics Health</span>
          <span className="text-xl font-bold text-[#06B6D4]">
            {data.length > 0 ? Math.round(((data.length - lowStockCount) / data.length) * 100) : 100}%
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-[#111622] p-2.5 rounded border border-[#1E2638] font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#5A677B] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock item, SKU, location..."
              className="w-full pl-8 pr-3 py-1 rounded bg-[#0B0E14] border border-[#1E2638] text-xs text-[#F0F4F8] placeholder-[#5A677B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[10px] uppercase text-[#8C9BAE] font-bold">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#161D2B] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                  : 'text-[#8C9BAE] hover:text-[#F0F4F8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No stock items match your search or filter parameters."
      />
    </div>
  );
};
