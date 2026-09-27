import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [data, setData] = useState<T.AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const records = await api.auditLogs.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: Column<T.AuditLog>[] = [
    {
      header: 'AUDIT ID',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          #LOG-{r.id}
        </span>
      ),
      accessorKey: 'id',
    },
    {
      header: 'ACTION EVENT',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.action}
        </span>
      ),
      accessorKey: 'action',
    },
    {
      header: 'TARGET ENTITY',
      render: r => (
        <span className="text-[#98A3B3]">
          {r.entityName || 'Entity'} (ID: {r.entityId || 'N/A'})
        </span>
      ),
    },
    {
      header: 'OPERATOR / PRINCIPAL',
      render: r => (
        <span className="font-semibold text-[#06B6D4]">
          {r.performedBy || 'ADMIN'}
        </span>
      ),
      accessorKey: 'performedBy',
    },
    {
      header: 'EVENT DETAILS',
      render: r => (
        <span className="text-[#98A3B3] text-[11px] block max-w-sm truncate">
          {r.details || 'System event recorded in audit database.'}
        </span>
      ),
      accessorKey: 'details',
    },
    {
      header: 'TIMESTAMP (UTC)',
      render: r => (
        <span className="text-[#657184] tabular-nums text-[11px]">
          {r.timestamp ? new Date(r.timestamp).toISOString().replace('T', ' ').substring(0, 19) : '—'}
        </span>
      ),
      accessorKey: 'timestamp',
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="SECURITY AUDIT TRAIL & SYSTEM LOGS"
        subtitle="IMMUTABLE SECURITY LEDGER // ADMINISTRATIVE ACTIONS & SUBSYSTEM LIFECYCLES"
        icon={ShieldCheck}
        badge="IMMUTABLE TRAIL"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchLogs();
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
        data={data.slice().reverse()}
        loading={loading}
        emptyMessage="NO AUDIT LOG EVENTS RECORDED"
        searchable
        searchPlaceholder="SEARCH AUDIT LOGS (ACTION, OPERATOR, DETAILS)..."
        pageSize={25}
      />
    </div>
  );
};
