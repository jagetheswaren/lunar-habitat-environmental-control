import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Wrench, RefreshCw, Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [data, setData] = useState<T.MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

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

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      item.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
      item.taskType?.toLowerCase().includes(search.toLowerCase()) ||
      item.technicianNotes?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority =
      filterPriority === 'ALL' || item.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const criticalTasks = data.filter(d => d.priority === 'CRITICAL' || d.priority === 'HIGH').length;
  const completedTasks = data.filter(d => d.status === 'COMPLETED').length;

  const columns: Column<T.MaintenanceRecord>[] = [
    {
      header: 'Task ID',
      accessorKey: 'id',
      className: 'w-20 text-[#06B6D4] font-bold',
      render: (r) => `#MNT-${r.id}`,
    },
    {
      header: 'Equipment System',
      render: (r) => (
        <div>
          <div className="font-semibold text-[#F0F4F8]">{r.equipmentName}</div>
          <div className="text-[10px] text-[#5A677B]">{r.taskType || 'Hardware Subsystem'}</div>
        </div>
      ),
    },
    {
      header: 'Sector',
      render: (r) => (
        <span className="text-[#8C9BAE]">
          {r.habitatZone?.name || 'Habitat Sector'}
        </span>
      ),
    },
    {
      header: 'Task Type',
      accessorKey: 'taskType',
      className: 'text-[#8C9BAE] text-[11px] uppercase',
    },
    {
      header: 'Priority',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
            r.priority === 'CRITICAL' || r.priority === 'HIGH'
              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
              : 'bg-[#161D2B] text-[#8C9BAE] border-[#1E2638]'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'SCHEDULED'} size="sm" />,
    },
    {
      header: 'Technician Audit Notes',
      render: (r) => (
        <span className="text-[#8C9BAE] text-xs max-w-xs block truncate">
          {r.technicianNotes || 'Routine inspection protocol on record.'}
        </span>
      ),
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      className: 'text-[#5A677B] text-[11px] tabular-nums',
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Life Support Maintenance Logs"
        subtitle="Preventive and corrective maintenance schedules for scrubbers, pumps, and electrolysis arrays"
        icon={Wrench}
        badge="HARDWARE LIFECYCLE"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchMaintenance();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
            REFRESH
          </button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638]">
          <span className="text-[10px] text-[#8C9BAE] uppercase block">Total PM Tasks</span>
          <span className="text-xl font-bold text-[#F0F4F8] tabular-nums">{data.length}</span>
        </div>
        <div className={`p-3 rounded border ${
          criticalTasks > 0 ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]' : 'bg-[#111622] border-[#1E2638] text-[#8C9BAE]'
        }`}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] uppercase font-bold">Critical / High</span>
            {criticalTasks > 0 && <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />}
          </div>
          <span className="text-xl font-bold tabular-nums">{criticalTasks}</span>
        </div>
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] uppercase font-bold">Completed</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <span className="text-xl font-bold text-[#10B981] tabular-nums">{completedTasks}</span>
        </div>
        <div className="p-3 rounded bg-[#111622] border border-[#1E2638]">
          <span className="text-[10px] text-[#8C9BAE] uppercase block">Equipment Reliability</span>
          <span className="text-xl font-bold text-[#06B6D4]">
            {data.length > 0 ? Math.round(((data.length - criticalTasks) / data.length) * 100) : 100}%
          </span>
        </div>
      </div>

      {/* Search and Priority Filter */}
      <div className="bg-[#111622] p-2.5 rounded border border-[#1E2638] font-mono text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#5A677B] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment, notes, description..."
              className="w-full pl-8 pr-3 py-1 rounded bg-[#0B0E14] border border-[#1E2638] text-xs text-[#F0F4F8] placeholder-[#5A677B] focus:outline-none focus:border-[#06B6D4]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-[10px] uppercase text-[#8C9BAE] font-bold">Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filterPriority === p
                  ? 'bg-[#161D2B] text-[#06B6D4] font-bold border border-[#06B6D4]/30'
                  : 'text-[#8C9BAE] hover:text-[#F0F4F8]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No maintenance work orders found."
      />
    </div>
  );
};
