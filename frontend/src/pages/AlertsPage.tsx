import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BellRing, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL' | 'RESOLVED'>('ALL');

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAll();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAck = async (id: number) => {
    try {
      await api.alerts.acknowledge(id, 'Acknowledged by Mission Commander via Tactical Terminal');
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

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'CRITICAL') return a.severity === 'CRITICAL' && a.status !== 'RESOLVED';
    if (statusFilter === 'ACTIVE') return a.status === 'ACTIVE';
    if (statusFilter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  const columns: Column<T.EnvironmentalAlert>[] = [
    {
      header: 'Alert ID',
      accessorKey: 'id',
      className: 'w-20 text-[#06B6D4] font-bold',
      render: (r) => `#ALT-${r.id}`,
    },
    {
      header: 'Severity',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
            r.severity === 'CRITICAL'
              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 pulse-critical'
              : r.severity === 'WARNING'
              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
              : 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {r.severity}
        </span>
      ),
    },
    {
      header: 'Violation Type',
      accessorKey: 'alertType',
      className: 'font-semibold text-[#F0F4F8] uppercase text-xs',
    },
    {
      header: 'Incident Description & Audit Trail',
      render: (r) => (
        <div className="max-w-md text-[#F0F4F8] text-xs leading-relaxed space-y-1">
          <div>{r.message}</div>
          {r.resolutionNotes && (
            <div className="text-[10px] text-[#10B981] font-mono">
              Audit Note: {r.resolutionNotes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      header: 'Timestamp (UTC)',
      accessorKey: 'createdAt',
      className: 'text-[#5A677B] text-[11px] tabular-nums',
    },
    {
      header: 'Operator Action',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === 'ACTIVE' && (
            <button
              onClick={() => handleAck(r.id)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 border border-[#F59E0B]/30 transition-colors uppercase font-semibold"
            >
              ACKNOWLEDGE
            </button>
          )}
          {r.status !== 'RESOLVED' && (
            <button
              onClick={() => handleResolve(r.id)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 border border-[#10B981]/30 transition-colors uppercase font-semibold"
            >
              RESOLVE
            </button>
          )}
          {r.status === 'RESOLVED' && (
            <span className="text-[10px] font-mono text-[#10B981] flex items-center gap-1 uppercase">
              <CheckCircle className="w-3 h-3" /> STABILIZED
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Incident Governance & Alerts"
        subtitle="Autonomous threshold violation detection, alert lifecycle state transitions, and operator audit trail"
        icon={BellRing}
        badge="LIFECYCLE AUDITED"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAlerts();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Incident Status Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
        <div className={`p-3 rounded border ${
          criticalCount > 0 ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]' : 'bg-[#111622] border-[#1E2638] text-[#8C9BAE]'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Critical Breaches</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-[#EF4444] pulse-critical' : 'text-[#8C9BAE]'}`} />
          </div>
          <span className="text-xl font-bold tabular-nums">{criticalCount}</span>
        </div>

        <div className="p-3 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Active Incidents</span>
            <BellRing className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <span className="text-xl font-bold text-[#F59E0B] tabular-nums">{activeCount}</span>
        </div>

        <div className="p-3 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Acknowledged</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{ackCount}</span>
        </div>

        <div className="p-3 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Stabilized / Resolved</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#111622] p-2 rounded border border-[#1E2638] font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[10px] uppercase text-[#8C9BAE] font-bold mr-1">Filter View:</span>
          {(['ALL', 'CRITICAL', 'ACTIVE', 'RESOLVED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                statusFilter === mode
                  ? 'bg-[#161D2B] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                  : 'text-[#8C9BAE] hover:text-[#F0F4F8]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-[#5A677B]">
          SHOWING {filteredAlerts.length} OF {alerts.length} ALERTS
        </span>
      </div>

      {/* Alerts Table */}
      <DataTable
        columns={columns}
        data={filteredAlerts}
        loading={loading}
        emptyMessage="No environmental alerts recorded under this filter."
      />
    </div>
  );
};
