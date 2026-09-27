import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Layers, RefreshCw } from 'lucide-react';

export const JournalsPage: React.FC = () => {
  const [data, setData] = useState<T.Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJournals = async () => {
    try {
      const records = await api.journals.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const columns: Column<T.Journal>[] = [
    {
      header: 'JOURNAL CODE',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.code}
        </span>
      ),
      accessorKey: 'code',
    },
    {
      header: 'JOURNAL NAME',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.name}
        </span>
      ),
      accessorKey: 'name',
    },
    {
      header: 'CLASSIFICATION',
      render: r => (
        <span className="text-[#98A3B3] uppercase text-[10px]">
          {r.type}
        </span>
      ),
      accessorKey: 'type',
    },
    {
      header: 'REPLICATION STATE',
      render: () => <StatusBadge status="ONLINE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="FINANCIAL JOURNAL TYPES"
        subtitle="DOUBLE-ENTRY BOOK CLASSIFICATIONS // GENERAL, SALES, PURCHASES, CASH & BANK BOOKS"
        icon={Layers}
        badge="LEDGER BOOKS"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchJournals();
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
        emptyMessage="NO FINANCIAL JOURNALS DEFINED"
        searchable
        searchPlaceholder="SEARCH JOURNALS (CODE, NAME)..."
        pageSize={20}
      />
    </div>
  );
};
