import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Users, RefreshCw } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [data, setData] = useState<T.Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const records = await api.contacts.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const columns: Column<T.Contact>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-cyan-400 font-bold',
      render: (r) => `#${r.id}`,
    },
    {
      header: 'Entity Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Relationship Type',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
            r.type === 'CUSTOMER'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : r.type === 'VENDOR'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      header: 'Comm Email',
      accessorKey: 'email',
      className: 'text-slate-300',
    },
    {
      header: 'Comms Frequency / Phone',
      accessorKey: 'phone',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Physical Habitat Station',
      accessorKey: 'address',
      className: 'text-slate-400 text-xs',
    },
    {
      header: 'Status',
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
        title="Entity & Commercial Directory"
        subtitle="Registered partner companies, lunar mining contractors, customer expeditions, and internal flight divisions"
        icon={Users}
        badge="DIRECTORY"
        actions={
          <button
            onClick={fetchContacts}
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
        emptyMessage="No partner entities registered."
      />
    </div>
  );
};
