import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [data, setData] = useState<T.AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const records = await api.auditLogs.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: Column<T.AuditLog>[] = [
    {
      header: 'Audit ID',
      accessorKey: 'id',
      className: 'w-20 text-cyan-400 font-bold',
      render: (r) => `#LOG-${r.id}`,
    },
    {
      header: 'Action Event',
      accessorKey: 'action',
      className: 'font-semibold text-white',
    },
    {
      header: 'Target Entity',
      render: (r) => `${r.entityName || 'Entity'} (ID: ${r.entityId || 'N/A'})`,
    },
    {
      header: 'Operator / Principal',
      accessorKey: 'performedBy',
      className: 'text-cyan-300 font-semibold',
    },
    {
      header: 'Event Details',
      accessorKey: 'details',
      className: 'text-slate-400 text-xs max-w-sm',
    },
    {
      header: 'Recorded Timestamp',
      accessorKey: 'timestamp',
      className: 'text-slate-400 text-[11px]',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Logs"
        subtitle="Append-only immutable record of administrative actions, billing transitions, and safety interventions"
        icon={ShieldCheck}
        badge="IMMUTABLE TRAIL"
        actions={
          <button
            onClick={fetchLogs}
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
        emptyMessage="No audit log events recorded."
      />
    </div>
  );
};
