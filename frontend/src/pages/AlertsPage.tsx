import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { BellRing, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';

interface Props {
  onNavigate?: (path: string) => void;
}

export const AlertsPage: React.FC<Props> = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CRITICAL' | 'RESOLVED'>('ALL');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAll();
      setAlerts(data);
      if (data.length > 0 && selectedAlertId === null) {
        setSelectedAlertId(data[0].id);
      }
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

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0] || null;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#273142] bg-[#10151D] text-[#98A2B3] hover:text-[#F2F5F7] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Incident Status Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className={`p-3 rounded border ${
          criticalCount > 0 ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]' : 'bg-[#10151D] border-[#273142] text-[#98A2B3]'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Critical Breaches</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-[#EF4444] pulse-critical' : 'text-[#667085]'}`} />
          </div>
          <span className="text-xl font-bold tabular-nums">{criticalCount}</span>
        </div>

        <div className="p-3 rounded bg-[#10151D] border border-[#273142] text-[#98A2B3]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Active Incidents</span>
            <BellRing className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <span className="text-xl font-bold text-[#F59E0B] tabular-nums">{activeCount}</span>
        </div>

        <div className="p-3 rounded bg-[#10151D] border border-[#273142] text-[#98A2B3]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Acknowledged</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <span className="text-xl font-bold text-[#06B6D4] tabular-nums">{ackCount}</span>
        </div>

        <div className="p-3 rounded bg-[#10151D] border border-[#273142] text-[#98A2B3]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">Stabilized / Resolved</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#10151D] p-2.5 rounded border border-[#273142] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[10px] uppercase text-[#667085] font-bold mr-1">Filter View:</span>
          {(['ALL', 'CRITICAL', 'ACTIVE', 'RESOLVED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                statusFilter === mode
                  ? 'bg-[#151B24] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                  : 'text-[#98A2B3] hover:text-[#F2F5F7]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-[#667085]">
          QUEUE: {filteredAlerts.length} OF {alerts.length} INCIDENTS
        </span>
      </div>

      {/* ================================================== */}
      {/* SPLIT VIEW: LEFT QUEUE + RIGHT INCIDENT DETAILS    */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: INCIDENT QUEUE (~42%) */}
        <div className="lg:col-span-5 bg-[#10151D] border border-[#273142] rounded p-3 flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#273142]">
            <span className="font-bold text-[#F2F5F7] text-xs uppercase tracking-wider">
              Incident Queue
            </span>
            <span className="text-[10px] text-[#667085]">SELECT TO INSPECT</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[580px] pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-[#667085]">
                <CheckCircle className="w-6 h-6 text-[#10B981] mx-auto mb-1.5" />
                <p>No incidents found in this view.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                const isCritical = alert.severity === 'CRITICAL';
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-2.5 rounded cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-l-2 border-l-[#06B6D4] bg-[#151B24] border-t-[#273142] border-r-[#273142] border-b-[#273142]'
                        : 'border-[#273142] bg-[#10151D] hover:bg-[#151B24]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                        isCritical
                          ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                          : alert.severity === 'WARNING'
                          ? 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                          : 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-[#06B6D4]'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-[#667085] tabular-nums">
                        {alert.createdAt ? alert.createdAt.substring(11, 19) + ' UTC' : 'RECENT'}
                      </span>
                    </div>

                    <div className="font-bold text-[#F2F5F7] text-xs uppercase truncate">
                      {alert.habitatZone?.name || 'HABITAT DOME ALPHA'}
                    </div>

                    <div className="text-[11px] text-[#98A2B3] truncate mt-0.5">
                      {alert.alertType}
                    </div>

                    <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#273142]/60 text-[10px]">
                      <span className="text-[#06B6D4]">#ALT-{alert.id}</span>
                      <StatusBadge status={alert.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INCIDENT DETAILS (~58%) */}
        <div className="lg:col-span-7 bg-[#10151D] border border-[#273142] rounded p-4 flex flex-col justify-between space-y-4">
          {selectedAlert ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="pb-3 border-b border-[#273142] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#06B6D4] font-bold">#ALT-{selectedAlert.id}</span>
                    <span className="text-[#273142]">•</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      selectedAlert.severity === 'CRITICAL'
                        ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                        : 'bg-[#F59E0B]/15 border-[#F59E0B]/40 text-[#F59E0B]'
                    }`}>
                      {selectedAlert.severity}
                    </span>
                    <StatusBadge status={selectedAlert.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F2F5F7] uppercase tracking-wide">
                    {selectedAlert.alertType}
                  </h3>
                  <p className="text-[11px] text-[#98A2B3] mt-0.5">
                    Sector: <span className="text-[#F2F5F7] font-semibold">{selectedAlert.habitatZone?.name || 'Habitat Dome Alpha'}</span>
                  </p>
                </div>

                <div className="text-right text-[11px] text-[#667085]">
                  <div>LOGGED:</div>
                  <div className="text-[#F2F5F7] tabular-nums font-semibold">
                    {selectedAlert.createdAt ? selectedAlert.createdAt.substring(0, 19).replace('T', ' ') + ' UTC' : 'REALTIME'}
                  </div>
                </div>
              </div>

              {/* Incident Metadata & Telemetry around Event */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded bg-[#151B24] border border-[#273142]">
                  <span className="text-[9px] text-[#667085] block uppercase">Violation Threshold</span>
                  <span className="text-sm font-bold text-[#F2F5F7] tabular-nums">950.0 PPM</span>
                  <span className="text-[9px] text-[#F59E0B] block mt-0.5">CEILING LIMIT</span>
                </div>

                <div className="p-2.5 rounded bg-[#151B24] border border-[#273142]">
                  <span className="text-[9px] text-[#667085] block uppercase">Measured Reading</span>
                  <span className="text-sm font-bold text-[#EF4444] tabular-nums">1280.0 PPM</span>
                  <span className="text-[9px] text-[#EF4444] block mt-0.5">+34.7% BREACH</span>
                </div>

                <div className="p-2.5 rounded bg-[#151B24] border border-[#273142]">
                  <span className="text-[9px] text-[#667085] block uppercase">Scrubber Response</span>
                  <span className="text-sm font-bold text-[#06B6D4]">BOOST ACTIVE</span>
                  <span className="text-[9px] text-[#10B981] block mt-0.5">AUTONOMOUS</span>
                </div>

                <div className="p-2.5 rounded bg-[#151B24] border border-[#273142]">
                  <span className="text-[9px] text-[#667085] block uppercase">Atmospheric Loop</span>
                  <span className="text-sm font-bold text-[#10B981]">ENGAGED</span>
                  <span className="text-[9px] text-[#98A2B3] block mt-0.5">100% RECLAMATION</span>
                </div>
              </div>

              {/* Message Details */}
              <div className="p-3 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block mb-1">
                  Incident Description & Diagnostics
                </span>
                <p className="text-xs text-[#F2F5F7] leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              {/* Resolution / Operator Notes */}
              <div className="p-3 rounded bg-[#151B24] border border-[#273142]">
                <span className="text-[10px] text-[#667085] uppercase font-bold block mb-1">
                  Operator History & Audit Notes
                </span>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  {selectedAlert.resolutionNotes || 'No operator audit notes submitted yet. Scrubber cycle executing nominal compensation curve.'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-[#273142] flex flex-wrap items-center gap-2">
                {selectedAlert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAck(selectedAlert.id)}
                    className="px-3 py-1.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 font-bold uppercase transition-colors"
                  >
                    ACKNOWLEDGE
                  </button>
                )}

                {selectedAlert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="px-3 py-1.5 rounded bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30 border border-[#10B981]/40 font-bold uppercase transition-colors"
                  >
                    RESOLVE
                  </button>
                )}

                <button
                  onClick={() => onNavigate && onNavigate('/digital-twin')}
                  className="px-3 py-1.5 rounded bg-[#151B24] text-[#06B6D4] hover:bg-[#19212C] border border-[#06B6D4]/40 font-semibold uppercase transition-colors"
                >
                  OPEN DIGITAL TWIN
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('/telemetry')}
                  className="px-3 py-1.5 rounded bg-[#151B24] text-[#98A2B3] hover:text-[#F2F5F7] border border-[#273142] font-semibold uppercase transition-colors"
                >
                  VIEW TELEMETRY
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-[#667085]">
              Select an incident from the queue to view full telemetry, automated reaction, and operator actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
