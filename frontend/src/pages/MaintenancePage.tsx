import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Wrench, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const [data, setData] = useState<T.MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const records = await api.maintenance.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const columns: Column<T.MaintenanceRecord>[] = [
    {
      header: 'Task ID',
      accessorKey: 'id',
      className: 'w-20 text-cyan-400 font-bold',
      render: (r) => `#MNT-${r.id}`,
    },
    {
      header: 'Equipment System',
      accessorKey: 'equipmentName',
      className: 'font-semibold text-white',
    },
    {
      header: 'Sector',
      render: (r) => r.habitatZone?.name || 'Habitat Sector',
    },
    {
      header: 'Task Type',
      accessorKey: 'taskType',
      className: 'text-slate-300',
    },
    {
      header: 'Priority',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
            r.priority === 'CRITICAL' || r.priority === 'HIGH'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'SCHEDULED'} />,
    },
    {
      header: 'Technician Notes',
      accessorKey: 'technicianNotes',
      className: 'text-slate-400 text-xs max-w-xs',
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      className: 'text-slate-400 text-[11px]',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Life Support Maintenance Logs"
        subtitle="Preventive and corrective maintenance schedules for scrubbers, pumps, and electrolysis arrays"
        icon={Wrench}
        badge="EQUIPMENT LOGS"
        actions={
          <button
            onClick={fetchMaintenance}
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
        emptyMessage="No equipment maintenance tasks recorded."
      />
    </div>
  );
};
