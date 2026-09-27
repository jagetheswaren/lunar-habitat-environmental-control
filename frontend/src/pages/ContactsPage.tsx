import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Users, RefreshCw, Search, Filter } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [data, setData] = useState<T.Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchContacts = async () => {
    try {
      const records = await api.contacts.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.phone?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns: Column<T.Contact>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-[#06B6D4] font-bold',
      render: (r) => `#${r.id}`,
    },
    {
      header: 'Entity Name',
      accessorKey: 'name',
      className: 'font-semibold text-[#F0F4F8]',
    },
    {
      header: 'Relationship Type',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
            r.type === 'CUSTOMER'
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
              : r.type === 'VENDOR'
              ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30'
              : 'bg-[#161D2B] text-[#8C9BAE] border-[#1E2638]'
          }`}
        >
          {r.type}
        </span>
      ),
    },
    {
      header: 'Comm Email',
      accessorKey: 'email',
      className: 'text-[#8C9BAE] text-xs',
    },
    {
      header: 'Comms Frequency / Phone',
      accessorKey: 'phone',
      className: 'text-[#8C9BAE] text-xs',
    },
    {
      header: 'Physical Habitat Station',
      accessorKey: 'address',
      className: 'text-[#8C9BAE] text-xs',
    },
    {
      header: 'Status',
      render: () => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 uppercase font-semibold">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Entity & Commercial Directory"
        subtitle="Mission partners, supply chain vendors, logistics contractors, and research consumers"
        icon={Users}
        badge="COMMERCIAL LEDGER"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchContacts();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-[#111622] p-2.5 rounded border border-[#1E2638] font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#5A677B] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner name, email, terminal..."
              className="w-full pl-8 pr-3 py-1 rounded bg-[#0B0E14] border border-[#1E2638] text-xs text-[#F0F4F8] placeholder-[#5A677B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[10px] uppercase text-[#8C9BAE] font-bold">Type:</span>
          {['ALL', 'CUSTOMER', 'VENDOR'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                typeFilter === t
                  ? 'bg-[#161D2B] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                  : 'text-[#8C9BAE] hover:text-[#F0F4F8]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No entities match the search or filter query."
      />
    </div>
  );
};
