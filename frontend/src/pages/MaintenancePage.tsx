import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { Wrench, RefreshCw, AlertTriangle, Clock, CheckCircle2, User, Box } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [data, setData] = useState<T.MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<T.MaintenanceRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchMaintenance = async () => {
    try {
      const records = await api.maintenance.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  // Summary counts
  const overdueCount = data.filter(d => d.priority === 'CRITICAL' && d.status !== 'COMPLETED').length;
  const dueTodayCount = data.filter(d => d.priority === 'HIGH' && d.status !== 'COMPLETED').length;
  const thisWeekCount = data.filter(d => d.status !== 'COMPLETED').length;

  const columns: Column<T.MaintenanceRecord>[] = [
    {
      header: 'ASSET',
      render: r => (
        <div>
          <span className="font-bold text-[#F1F4F6] block">{r.equipmentName}</span>
          <span className="text-[10px] text-[#657184] uppercase">{r.taskType || 'SUBSYSTEM'}</span>
        </div>
      ),
    },
    {
      header: 'ZONE',
      render: r => (
        <span className="text-[#06B6D4] font-semibold">
          {r.habitatZone?.name || (r as any).habitatZoneName || 'DOME ALPHA'}
        </span>
      ),
    },
    {
      header: 'WORK ORDER',
      render: r => (
        <span className="text-[#98A3B3] font-bold">
          WO-{String(r.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      header: 'PRIORITY',
      render: r => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
            r.priority === 'CRITICAL' || r.priority === 'HIGH'
              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
              : 'bg-[#161F2A] text-[#98A3B3] border-[#283443]'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      header: 'ASSIGNEE',
      render: r => (
        <span className="text-[#F1F4F6]">
          {(r as any).assignedTo || 'CHIEF ENG. REED'}
        </span>
      ),
    },
    {
      header: 'DUE DATE',
      render: r => (
        <span className="text-[#98A3B3] tabular-nums">
          {r.scheduledDate
            ? new Date(r.scheduledDate).toISOString().substring(0, 10)
            : '2026-09-29'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.status || 'SCHEDULED'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="LIFE SUPPORT MAINTENANCE & ASSET GOVERNANCE"
        subtitle="WORK ORDER DISPATCH // PREVENTATIVE & CORRECTIVE MAINTENANCE SCHEDULE"
        icon={Wrench}
        badge="CMMS WORK ORDERS"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchMaintenance();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#283443] bg-[#161F2A] hover:bg-[#1B2531] text-[#98A3B3] hover:text-[#F1F4F6] uppercase font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* Header Summary Compact Rail */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-[#111820] border border-[#283443] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#657184] uppercase font-bold block">OVERDUE</span>
            <span className={`text-2xl font-bold tabular-nums ${overdueCount > 0 ? 'text-[#EF4444]' : 'text-[#F1F4F6]'}`}>
              {overdueCount}
            </span>
          </div>
          <AlertTriangle className={`w-5 h-5 ${overdueCount > 0 ? 'text-[#EF4444]' : 'text-[#657184]'}`} />
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#657184] uppercase font-bold block">DUE TODAY</span>
            <span className="text-2xl font-bold text-[#F59E0B] tabular-nums">
              {dueTodayCount}
            </span>
          </div>
          <Clock className="w-5 h-5 text-[#F59E0B]" />
        </div>

        <div className="p-3 bg-[#111820] border border-[#283443] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#657184] uppercase font-bold block">THIS WEEK</span>
            <span className="text-2xl font-bold text-[#06B6D4] tabular-nums">
              {thisWeekCount}
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#06B6D4]" />
        </div>
      </div>

      {/* Maintenance Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="NO WORK ORDERS SCHEDULED FOR ACTIVE ASSETS"
        searchable
        searchPlaceholder="SEARCH WORK ORDERS (EQUIPMENT, ZONE, PRIORITY)..."
        onRowClick={row => {
          setSelectedRecord(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedRecord?.id}
      />

      {/* Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedRecord?.equipmentName || 'WORK ORDER'}
        subtitle={`WO-${String(selectedRecord?.id).padStart(4, '0')} // ${selectedRecord?.taskType || 'MAINTENANCE'}`}
        badge={selectedRecord?.priority || 'NORMAL'}
        badgeType={selectedRecord?.priority === 'CRITICAL' ? 'critical' : 'warning'}
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">STATUS: {selectedRecord?.status}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedRecord && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                WORK ORDER SUMMARY
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] block">TARGET ZONE</span>
                  <span className="font-bold text-[#06B6D4]">
                    {selectedRecord.habitatZone?.name || 'HABITAT SECTOR'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">PRIORITY LEVEL</span>
                  <span className="font-bold text-[#EF4444]">{selectedRecord.priority}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">SCHEDULED SOL</span>
                  <span className="font-bold text-[#F1F4F6]">SOL 0188</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">ASSIGNEE</span>
                  <span className="font-bold text-[#F1F4F6]">CHIEF ENG. REED</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1.5">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                TECHNICIAN AUDIT NOTES
              </span>
              <p className="text-[11px] text-[#98A3B3]">
                {selectedRecord.technicianNotes ||
                  'Inspect catalytic bed for amine depletion, verify solenoid valve actuation and run baseline leak check.'}
              </p>
            </div>

            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                REQUIRED SPARES & TOOLS
              </span>
              <ul className="list-disc list-inside text-[11px] text-[#F1F4F6] space-y-1">
                <li>1x LiOH Hydroxide Canister (CAN-LiOH-40)</li>
                <li>2x Cryogenic Viton O-Rings</li>
                <li>Digital Torq-Wrench Calibration Kit</li>
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
