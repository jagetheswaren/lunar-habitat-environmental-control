import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ThresholdsPage: React.FC = () => {
  const [data, setData] = useState<T.EnvironmentalThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThresholds = async () => {
    try {
      const records = await api.thresholds.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const columns: Column<T.EnvironmentalThreshold>[] = [
    {
      header: 'RULE ID',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          #THR-{r.id}
        </span>
      ),
      accessorKey: 'id',
    },
    {
      header: 'METRIC TYPE',
      render: r => (
        <span className="font-bold text-[#F1F4F6]">
          {r.metricType}
        </span>
      ),
      accessorKey: 'metricType',
    },
    {
      header: 'SECTOR ZONE',
      render: r => (
        <span className="text-[#06B6D4] font-semibold">
          {r.habitatZone?.name || 'ALL HABITAT MODULES'}
        </span>
      ),
    },
    {
      header: 'SAFE OPERATING WINDOW',
      render: r => (
        <span className="tabular-nums text-[#10B981] font-semibold">
          {r.warningLow ?? '—'} to {r.warningHigh ?? '—'} {r.unit}
        </span>
      ),
    },
    {
      header: 'CRITICAL BREACH LIMIT',
      render: r => (
        <span className="text-[#EF4444] font-bold tabular-nums">
          {r.criticalLow ? `< ${r.criticalLow}` : ''} {r.criticalHigh ? `> ${r.criticalHigh}` : ''} {r.unit}
        </span>
      ),
    },
    {
      header: 'AUTONOMOUS ACTION PROTOCOL',
      render: r => (
        <span className="text-[#98A3B3] text-[11px] block max-w-sm truncate">
          {r.actionProtocol || 'Dispatch catalytic scrubber boost and log audit incident.'}
        </span>
      ),
    },
    {
      header: 'STATUS',
      render: () => <StatusBadge status="ACTIVE" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="ATMOSPHERIC SAFETY THRESHOLDS"
        subtitle="AUTONOMOUS TRIGGER CONSTRAINTS // LIFE-SUPPORT AUTOMATION & INCIDENT CEILINGS"
        icon={Sliders}
        badge="SCADA CONSTRAINTS"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchThresholds();
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
        data={data}
        loading={loading}
        emptyMessage="NO SAFETY THRESHOLDS CONFIGURED"
        searchable
        searchPlaceholder="SEARCH THRESHOLDS (METRIC, SECTOR, ACTION)..."
        pageSize={20}
      />
    </div>
  );
};
