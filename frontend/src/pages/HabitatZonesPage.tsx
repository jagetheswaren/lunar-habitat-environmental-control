import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Globe2, RefreshCw, Users, Box, Wind } from 'lucide-react';

export const HabitatZonesPage: React.FC = () => {
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await api.zones.getAll();
      setZones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const columns: Column<T.HabitatZone>[] = [
    {
      header: 'Code',
      accessorKey: 'code',
      className: 'w-24 text-cyan-400 font-bold',
    },
    {
      header: 'Biosphere Zone Name',
      accessorKey: 'name',
      className: 'font-semibold text-white',
    },
    {
      header: 'Description',
      accessorKey: 'description',
      className: 'text-slate-400 text-xs max-w-sm',
    },
    {
      header: 'Target Pressure',
      render: (r) => `${r.targetPressureKpa ?? 101.3} kPa`,
    },
    {
      header: 'Max CO₂ Limit',
      render: (r) => `${r.maxCo2Ppm ?? 950} PPM`,
    },
    {
      header: 'Min Water Purity',
      render: (r) => `${r.minWaterPurityPercent ?? 98}%`,
    },
    {
      header: 'Operational Status',
      render: (r) => <StatusBadge status={r.operationalStatus || 'OPERATIONAL'} />,
    },
    {
      header: 'Occupancy',
      render: (r) => (
        <span className="flex items-center gap-1 text-slate-300">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          {r.occupancyCount ?? 6} CREW
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habitat Biosphere Sectors"
        subtitle="Physical pressurized zones, life-support modular biomes, and crew sectors"
        icon={Globe2}
        badge="PRESSURIZED SECTORS"
        actions={
          <button
            onClick={fetchZones}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-slate-700 bg-space-850 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((z) => (
          <div key={z.id} className="lunar-glass-card rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold">{z.code}</span>
              <StatusBadge status={z.operationalStatus || 'OPERATIONAL'} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">{z.name}</h4>
            <p className="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
              {z.description || 'Pressurized lunar biome sector.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800 pt-3 text-slate-400">
              <div>PRESSURE: <span className="text-white font-semibold">{z.targetPressureKpa || 101.3} kPa</span></div>
              <div>MAX CO₂: <span className="text-white font-semibold">{z.maxCo2Ppm || 950} ppm</span></div>
              <div>VOLUME: <span className="text-white font-semibold">{z.totalVolumeM3 || 4500} m³</span></div>
              <div>OCCUPANCY: <span className="text-cyan-400 font-semibold">{z.occupancyCount || 4}</span></div>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={zones}
        loading={loading}
        emptyMessage="No habitat sectors registered."
      />
    </div>
  );
};
