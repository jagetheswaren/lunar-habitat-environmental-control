import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BellRing, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.alerts.getAll();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAck = async (id: number) => {
    try {
      await api.alerts.acknowledge(id, 'Acknowledged by mission commander via console');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.alerts.resolve(id, 'Atmospheric scrubbers engaged, levels stabilized within safe margins');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<T.EnvironmentalAlert>[] = [
    {
      header: 'Alert ID',
      accessorKey: 'id',
      className: 'w-20 text-cyan-400 font-bold',
      render: (r) => `#ALT-${r.id}`,
    },
    {
      header: 'Severity',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
            r.severity === 'CRITICAL'
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : r.severity === 'WARNING'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
          }`}
        >
          {r.severity}
        </span>
      ),
    },
    {
      header: 'Violation Type',
      accessorKey: 'alertType',
      className: 'font-semibold text-white',
    },
    {
      header: 'Incident Description',
      render: (r) => (
        <div className="max-w-md text-slate-300 text-xs leading-relaxed">
          {r.message}
          {r.resolutionNotes && (
            <div className="text-[10px] text-emerald-400 mt-1">
              Resolution: {r.resolutionNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      className: 'text-slate-400 text-[11px]',
    },
    {
      header: 'Action Protocol',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.status === 'ACTIVE' && (
            <button
              onClick={() => handleAck(r.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
            >
              ACKNOWLEDGE
            </button>
          )}
          {r.status !== 'RESOLVED' && (
            <button
              onClick={() => handleResolve(r.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            >
              RESOLVE
            </button>
          )}
          {r.status === 'RESOLVED' && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> STABILIZED
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Incident Governance"
        subtitle="Autonomous threshold violation detection, alert lifecycle state transitions, and audit records"
        icon={BellRing}
        badge="LIFECYCLE VERIFIED"
        actions={
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 bg-space-850 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={alerts}
        loading={loading}
        emptyMessage="No environmental threshold alerts currently registered."
      />
    </div>
  );
};
