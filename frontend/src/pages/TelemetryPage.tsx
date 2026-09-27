import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Radio, PlusCircle, RefreshCw } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const [data, setData] = useState<T.Telemetry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const records = await api.telemetry.getAll();
      setData(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const columns: Column<T.Telemetry>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      className: 'w-16 text-cyan-400 font-bold',
      render: (r) => `#${r.id}`,
    },
    {
      header: 'Sector Zone',
      render: (r) => (
        <div>
          <div className="font-semibold text-white">{r.habitatZone?.name || 'Dome Alpha'}</div>
          <div className="text-[10px] text-slate-500">{r.habitatZone?.code || 'ZONE-ALPHA'}</div>
        </div>
      ),
    },
    {
      header: 'Pressure',
      render: (r) => `${Number(r.atmosphericPressureKpa).toFixed(2)} kPa`,
    },
    {
      header: 'CO₂ Level',
      render: (r) => (
        <span className={Number(r.co2LevelPpm) > 950 ? 'text-red-400 font-bold' : 'text-slate-200'}>
          {Number(r.co2LevelPpm).toFixed(1)} PPM
        </span>
      ),
    },
    {
      header: 'Water Purity',
      render: (r) => `${Number(r.waterPurityPercent).toFixed(1)}%`,
    },
    {
      header: 'Temperature',
      render: (r) => `${Number(r.temperatureCelsius).toFixed(1)} °C`,
    },
    {
      header: 'Humidity',
      render: (r) => `${Number(r.humidityPercent).toFixed(1)}%`,
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status || 'NORMAL'} />,
    },
    {
      header: 'Source',
      render: (r) => <span className="text-[11px] text-slate-400">{r.source || 'SENSOR'}</span>,
    },
    {
      header: 'Timestamp (UTC)',
      accessorKey: 'recordedAt',
      className: 'text-slate-400 text-[11px]',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Telemetry Stream"
        subtitle="Real-time multi-spectral sensor feeds across all lunar habitat biospheres"
        icon={Radio}
        badge="REAL DATABASE"
        actions={
          <button
            onClick={fetchTelemetry}
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
        emptyMessage="No telemetry streams transmitted to database yet."
      />
    </div>
  );
};
