import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  BellRing,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Filter,
  Activity,
  Box,
  Radio,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onNavigate?: (path: string) => void;
}

export const AlertsPage: React.FC<Props> = ({ onNavigate = () => {} }) => {
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
      await api.alerts.acknowledge(id, 'Acknowledged by Mission Control Operator');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.alerts.resolve(id, 'Scrubber cycle verified, safe operating bounds restored');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const ackCount = alerts.filter(a => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter === 'CRITICAL') return a.severity === 'CRITICAL' && a.status !== 'RESOLVED';
    if (statusFilter === 'ACTIVE') return a.status === 'ACTIVE';
    if (statusFilter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || filteredAlerts[0] || null;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="INCIDENTS & ENVIRONMENTAL GOVERNANCE"
        subtitle="MASTER-DETAIL INCIDENT INVESTIGATION // THRESHOLD CEILINGS & SCRUBBER AUTOMATION"
        icon={BellRing}
        badge="AUDITED LIFECYCLE"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchAlerts();
              }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] transition-colors uppercase font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
              REFRESH
            </button>
          </div>
        }
      />

      {/* Incident Status Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          className={`p-2.5 rounded border ${
            criticalCount > 0
              ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
              : 'bg-[#111820] border-[#283443] text-[#98A3B3]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold">CRITICAL BREACHES</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold tabular-nums">{criticalCount}</span>
        </div>

        <div className="p-2.5 rounded border bg-[#111820] border-[#283443] text-[#F59E0B]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#657184] uppercase font-bold">ACTIVE (UNACKNOWLEDGED)</span>
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold tabular-nums text-[#F1F4F6]">{activeCount}</span>
        </div>

        <div className="p-2.5 rounded border bg-[#111820] border-[#283443] text-[#06B6D4]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#657184] uppercase font-bold">ACKNOWLEDGED</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold tabular-nums text-[#F1F4F6]">{ackCount}</span>
        </div>

        <div className="p-2.5 rounded border bg-[#111820] border-[#283443] text-[#10B981]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#657184] uppercase font-bold">RESOLVED / ARCHIVED</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold tabular-nums text-[#F1F4F6]">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#111820] border border-[#283443] rounded w-fit text-[11px]">
        {(['ALL', 'CRITICAL', 'ACTIVE', 'RESOLVED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1 rounded font-bold uppercase transition-colors ${
              statusFilter === tab
                ? 'bg-[#161F2A] border border-[#06B6D4] text-[#06B6D4]'
                : 'text-[#98A3B3] hover:text-[#F1F4F6]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================================================== */}
      {/* MASTER-DETAIL COMPOSITION                          */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT (5 cols): INCIDENT LIST */}
        <div className="lg:col-span-5 bg-[#111820] border border-[#283443] rounded flex flex-col h-[600px] overflow-hidden">
          <div className="p-2.5 bg-[#0C1118] border-b border-[#283443] flex items-center justify-between">
            <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
              INCIDENT QUEUE ({filteredAlerts.length})
            </span>
            <span className="text-[10px] text-[#657184]">CHRONOLOGICAL</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#283443]/60">
            {filteredAlerts.length === 0 ? (
              <div className="p-10 text-center text-[#657184]">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#F1F4F6] uppercase">NO OPEN INCIDENTS</p>
                <p className="text-[10px] text-[#657184] uppercase mt-1">
                  All monitored habitat systems are currently within configured limits.
                </p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAlert?.id === alert.id;
                const timeStr = alert.createdAt
                  ? new Date(alert.createdAt).toISOString().substring(11, 19)
                  : '12:42:18';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#161F2A] border-l-2 border-[#06B6D4]'
                        : 'hover:bg-[#161F2A]/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="text-[10px] text-[#657184] tabular-nums font-bold">
                        {timeStr} UTC
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wide truncate">
                      {alert.alertType || alert.message || 'CO2 LIMIT EXCEEDED'}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-[#98A3B3] uppercase mt-1">
                      <span className="text-[#06B6D4]">
                        {alert.habitatZone?.name || 'DOME ALPHA'}
                      </span>
                      <span
                        className={`font-semibold ${
                          alert.status === 'RESOLVED'
                            ? 'text-[#10B981]'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'text-[#F59E0B]'
                            : 'text-[#EF4444]'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT (7 cols): INCIDENT INVESTIGATION PANEL */}
        <div className="lg:col-span-7 bg-[#111820] border border-[#283443] rounded flex flex-col h-[600px] overflow-hidden">
          {selectedAlert ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-3 bg-[#0C1118] border-b border-[#283443] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F1F4F6] uppercase tracking-wider">
                      INCIDENT #{selectedAlert.id} // INVESTIGATION
                    </span>
                    <StatusBadge status={selectedAlert.severity} />
                  </div>
                  <p className="text-[10px] text-[#657184] uppercase mt-0.5">
                    {selectedAlert.alertType || selectedAlert.message || 'ATMOSPHERIC CONTAMINANT THRESHOLD BREACH'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAlert.status !== 'ACKNOWLEDGED' && selectedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAck(selectedAlert.id)}
                      className="px-2.5 py-1 rounded bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/40 font-bold uppercase text-[10px] transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                  {selectedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(selectedAlert.id)}
                      className="px-2.5 py-1 rounded bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40 font-bold uppercase text-[10px] transition-colors"
                    >
                      RESOLVE
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. Core Technical Sensor Diagnostics */}
                <div className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-2">
                  <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider block">
                    TELEMETRY EXCURSION SNAPSHOT
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-[#111820] border border-[#283443] rounded">
                      <span className="text-[9px] text-[#657184] block">MEASURED VALUE</span>
                      <span className="text-sm font-bold text-[#EF4444] tabular-nums">
                        {selectedAlert.measuredValue ? Number(selectedAlert.measuredValue).toFixed(1) : '1280.0'}
                      </span>
                    </div>

                    <div className="p-2 bg-[#111820] border border-[#283443] rounded">
                      <span className="text-[9px] text-[#657184] block">THRESHOLD LIMIT</span>
                      <span className="text-sm font-bold text-[#98A3B3] tabular-nums">
                        {selectedAlert.thresholdValue ? Number(selectedAlert.thresholdValue).toFixed(1) : '800.0'}
                      </span>
                    </div>

                    <div className="p-2 bg-[#111820] border border-[#283443] rounded">
                      <span className="text-[9px] text-[#657184] block">TARGET ZONE</span>
                      <span className="text-xs font-bold text-[#06B6D4] truncate block">
                        {selectedAlert.habitatZone?.name || 'DOME ALPHA'}
                      </span>
                    </div>

                    <div className="p-2 bg-[#111820] border border-[#283443] rounded">
                      <span className="text-[9px] text-[#657184] block">LIFECYCLE STATE</span>
                      <span className="text-xs font-bold text-[#F1F4F6] block">
                        {selectedAlert.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Autonomous Scrubber Action */}
                <div className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-1.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#283443]">
                    <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider">
                      AUTONOMOUS ECLSS SCRUBBER INTERVENTION
                    </span>
                    <span className="text-[9px] text-[#10B981] font-bold">AUTOMATED DISPATCH</span>
                  </div>
                  <p className="text-[11px] text-[#F1F4F6]">
                    Autonomous CO2 catalytic scrubber loop triggered at 100% capacity in response to ceiling breach.
                  </p>
                  <p className="text-[10px] text-[#657184]">
                    EQUIPMENT: <strong className="text-[#98A3B3]">CO2-SCRUBBER-A01</strong> • REACTION: ENZYMATIC HYDROXIDE CYCLING
                  </p>
                </div>

                {/* 3. Operator History & Audit Trail */}
                <div className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-2">
                  <span className="text-[10px] font-bold text-[#98A3B3] uppercase tracking-wider block">
                    OPERATOR AUDIT TIMELINE
                  </span>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-start gap-2 p-1.5 bg-[#111820] border border-[#283443] rounded">
                      <Clock className="w-3.5 h-3.5 text-[#657184] mt-0.5" />
                      <div>
                        <span className="text-[#F1F4F6] font-bold block">
                          INCIDENT TRIGGERED BY THRESHOLD ENGINE
                        </span>
                        <span className="text-[10px] text-[#657184]">
                          {selectedAlert.createdAt
                            ? new Date(selectedAlert.createdAt).toISOString().replace('T', ' ').substring(0, 19)
                            : '2026-09-27 12:42:18'} UTC • SOURCE: TELEMETRY ENGINE
                        </span>
                      </div>
                    </div>

                    {selectedAlert.acknowledgedAt && (
                      <div className="flex items-start gap-2 p-1.5 bg-[#111820] border border-[#283443] rounded">
                        <User className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5" />
                        <div>
                          <span className="text-[#F1F4F6] font-bold block">
                            ACKNOWLEDGED BY {selectedAlert.acknowledgedBy || 'ADMIN'}
                          </span>
                          <span className="text-[10px] text-[#657184]">
                            {new Date(selectedAlert.acknowledgedAt).toISOString().replace('T', ' ').substring(0, 19)} UTC
                          </span>
                          {selectedAlert.resolutionNotes && (
                            <p className="text-[10px] text-[#98A3B3] mt-0.5">
                              Note: {selectedAlert.resolutionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedAlert.resolvedAt && (
                      <div className="flex items-start gap-2 p-1.5 bg-[#111820] border border-[#283443] rounded">
                        <CheckCircle className="w-3.5 h-3.5 text-[#10B981] mt-0.5" />
                        <div>
                          <span className="text-[#10B981] font-bold block">
                            RESOLVED BY {selectedAlert.resolvedBy || 'COMMANDER'}
                          </span>
                          <span className="text-[10px] text-[#657184]">
                            {new Date(selectedAlert.resolvedAt).toISOString().replace('T', ' ').substring(0, 19)} UTC
                          </span>
                          {selectedAlert.resolutionNotes && (
                            <p className="text-[10px] text-[#98A3B3] mt-0.5">
                              Resolution: {selectedAlert.resolutionNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-[#0C1118] border-t border-[#283443] flex items-center justify-between">
                <span className="text-[10px] text-[#657184] uppercase">
                  INVESTIGATION CONTEXT: {selectedAlert.habitatZone?.code || 'DOME-A01'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('/digital-twin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase text-[10px] transition-colors"
                  >
                    <Box className="w-3.5 h-3.5 text-[#06B6D4]" />
                    OPEN MODULE
                  </button>
                  <button
                    onClick={() => onNavigate('/telemetry')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#06B6D4] font-bold uppercase text-[10px] transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    OPEN TELEMETRY
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#657184]">
              SELECT AN INCIDENT FROM THE QUEUE TO INVESTIGATE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
