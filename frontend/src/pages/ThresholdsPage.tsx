import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { Sliders, RefreshCw } from 'lucide-react';

export const ThresholdsPage: React.FC = () => {
  const [data, setData] = useState<T.EnvironmentalThreshold[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThresholds = async () => {
    setLoading(true);
    try {
      const records = await api.thresholds.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const columns: Column<T.EnvironmentalThreshold>[] = [
    {
      header: 'Rule ID',
      accessorKey: 'id',
      className: 'w-20 text-cyan-400 font-bold',
      render: (r) => `#THR-${r.id}`,
    },
    {
      header: 'Metric Type',
      accessorKey: 'metricType',
      className: 'font-semibold text-white',
    },
    {
      header: 'Zone Sector',
      render: (r) => r.habitatZone?.name || 'ALL HABITAT DCORES',
    },
    {
      header: 'Safe Operating Window',
      render: (r) => (
        <span>
          {r.warningLow ?? '—'} to {r.warningHigh ?? '—'} {r.unit}
        </span>
      ),
    },
    {
      header: 'Critical Breach Limit',
      render: (r) => (
        <span className="text-red-400 font-semibold">
          {r.criticalLow ? `< ${r.criticalLow}` : ''} {r.criticalHigh ? `> ${r.criticalHigh}` : ''} {r.unit}
        </span>
      ),
    },
    {
      header: 'Automated Action Protocol',
      accessorKey: 'actionProtocol',
      className: 'text-slate-300 text-xs max-w-xs',
    },
    {
      header: 'Active',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ACTIVE
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atmospheric Safety Threshold Rules"
        subtitle="Automated environmental constraints triggering autonomous scrubber routines and alarms"
        icon={Sliders}
        badge="FLYWAY SEEDED"
        actions={
          <button
            onClick={fetchThresholds}
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
        emptyMessage="No safety thresholds defined in database."
      />
    </div>
  );
};
