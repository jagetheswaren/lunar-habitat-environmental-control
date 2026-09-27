import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Package, RefreshCw } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [data, setData] = useState<T.Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const records = await api.products.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: Column<T.Product>[] = [
    {
      header: 'SKU',
      accessorKey: 'sku',
      className: 'w-24 text-cyan-400 font-bold',
    },
    {
      header: 'Resource / Service Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      className: 'text-slate-300',
    },
    {
      header: 'Unit of Measure',
      accessorKey: 'unitOfMeasure',
      className: 'text-slate-400 font-mono text-xs',
    },
    {
      header: 'Standard Cost',
      render: (r) => `$${Number(r.standardCost || 0).toFixed(2)}`,
    },
    {
      header: 'Billing Rate / List Price',
      render: (r) => (
        <span className="font-semibold text-emerald-400">
          ${Number(r.listPrice || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Catalog Status',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource & Consumables Catalog"
        subtitle="Standardized life-support consumables, scrubbers, nitrogen gases, and reclamation service tariffs"
        icon={Package}
        badge="TARIFF MASTER"
        actions={
          <button
            onClick={fetchProducts}
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
        emptyMessage="No catalog items found."
      />
    </div>
  );
};
