import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { UserCheck, RefreshCw, Shield } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [data, setData] = useState<T.User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const records = await api.users.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<T.User>[] = [
    {
      header: 'Operator Call-Sign',
      accessorKey: 'username',
      className: 'font-bold text-cyan-400 font-mono',
    },
    {
      header: 'Full Legal Identity',
      accessorKey: 'fullName',
      className: 'font-semibold text-white',
    },
    {
      header: 'Mission Email',
      accessorKey: 'email',
      className: 'text-slate-300',
    },
    {
      header: 'Assigned Security Roles',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.roles?.map((role, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
            >
              {role.replace('ROLE_', '')}
            </span>
          )) || <span className="text-slate-500">OPERATOR</span>}
        </div>
      ),
    },
    {
      header: 'Authentication Status',
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
        title="Personnel & Role Administration"
        subtitle="Mission operator clearance tiers, RBAC security roles, and user directory"
        icon={UserCheck}
        badge="RBAC LEVEL 4"
        actions={
          <button
            onClick={fetchUsers}
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
        emptyMessage="No personnel records found."
      />
    </div>
  );
};
