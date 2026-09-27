import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Package, RefreshCw } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [data, setData] = useState<T.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const records = await api.products.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: Column<T.Product>[] = [
    {
      header: 'CODE',
      render: r => (
        <span className="text-[#06B6D4] font-bold">
          {r.sku}
        </span>
      ),
      accessorKey: 'sku',
    },
    {
      header: 'PRODUCT',
      render: r => (
        <div>
          <span className="font-bold text-[#F1F4F6] block">{r.name}</span>
          <span className="text-[10px] text-[#657184] truncate block max-w-xs">{(r as any).description || 'ECLSS Resource'}</span>
        </div>
      ),
      accessorKey: 'name',
    },
    {
      header: 'TYPE',
      render: r => (
        <span className="text-[#98A3B3] uppercase text-[10px]">
          {r.category || 'CONSUMABLE'}
        </span>
      ),
    },
    {
      header: 'UNIT',
      render: r => (
        <span className="text-[#657184] uppercase">
          {r.unitOfMeasure || 'L'}
        </span>
      ),
    },
    {
      header: 'SALE PRICE',
      render: r => (
        <span className="text-[#10B981] font-bold tabular-nums">
          ₹{Number(r.listPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'listPrice',
    },
    {
      header: 'COST',
      render: r => (
        <span className="text-[#F1F4F6] tabular-nums">
          ₹{Number(r.standardCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      align: 'right',
      accessorKey: 'standardCost',
    },
    {
      header: 'STOCK',
      render: r => (
        <span className="text-[#06B6D4] font-bold tabular-nums">
          {((r as any).stockOnHand || 1200).toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'STATUS',
      render: () => <StatusBadge status="ACTIVE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="RESOURCE & COMMODITY PRODUCTS"
        subtitle="MASTER TARIFF CATALOG // STANDARDIZED LIFE-SUPPORT CONSUMABLES & SERVICES"
        icon={Package}
        badge="TARIFF MASTER"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchProducts();
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
        emptyMessage="NO COMMODITY PRODUCTS FOUND IN MASTER TARIFF"
        searchable
        searchPlaceholder="SEARCH PRODUCTS (CODE, NAME, CATEGORY)..."
        pageSize={25}
      />
    </div>
  );
};
