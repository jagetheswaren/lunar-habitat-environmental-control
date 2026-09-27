import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Layers, RefreshCw } from 'lucide-react';

export const JournalsPage: React.FC = () => {
  const [data, setData] = useState<T.Journal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const records = await api.journals.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const columns: Column<T.Journal>[] = [
    {
      header: 'Journal Code',
      accessorKey: 'code',
      className: 'font-bold text-cyan-400 font-mono w-28',
    },
    {
      header: 'Journal Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Type Category',
      accessorKey: 'type',
      className: 'text-slate-300 font-mono',
    },
    {
      header: 'Replication State',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ONLINE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Classifications"
        subtitle="Specialized financial journals: Sales, Purchases, Bank Disbursements, Cash, and Miscellaneous Operations"
        icon={Layers}
        badge="JOURNALS"
        actions={
          <button
            onClick={fetchJournals}
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
        emptyMessage="No journal classifications found."
      />
    </div>
  );
};
