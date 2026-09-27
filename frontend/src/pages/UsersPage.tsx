import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { UserCheck, RefreshCw, Shield } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [data, setData] = useState<T.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const records = await api.users.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<T.User>[] = [
    {
      header: 'OPERATOR CALL-SIGN',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.username?.toUpperCase()}
        </span>
      ),
      accessorKey: 'username',
    },
    {
      header: 'FULL LEGAL IDENTITY',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.fullName}
        </span>
      ),
      accessorKey: 'fullName',
    },
    {
      header: 'MISSION EMAIL',
      render: r => (
        <span className="text-[#98A3B3]">
          {r.email}
        </span>
      ),
      accessorKey: 'email',
    },
    {
      header: 'RBAC CLEARANCE ROLES',
      render: r => (
        <div className="flex flex-wrap gap-1">
          {r.roles?.map((role, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#161F2A] text-[#06B6D4] border border-[#283443] uppercase"
            >
              {role.replace('ROLE_', '')}
            </span>
          )) || <span className="text-[#657184]">OPERATOR</span>}
        </div>
      ),
    },
    {
      header: 'STATUS',
      render: () => <StatusBadge status="ACTIVE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="PERSONNEL & ROLE ADMINISTRATION"
        subtitle="RBAC ACCESS CONTROL // OPERATOR CLEARANCE TIERS & CREDENTIAL GOVERNANCE"
        icon={UserCheck}
        badge="RBAC LEVEL 4"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchUsers();
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
        emptyMessage="NO PERSONNEL RECORDS FOUND"
        searchable
        searchPlaceholder="SEARCH OPERATORS (CALL-SIGN, NAME)..."
        pageSize={20}
      />
    </div>
  );
};
