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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {zones.map((z) => (
          <div key={z.id} className="bg-[#111622] rounded p-4 border border-[#1E2638] font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#06B6D4] font-bold">{z.code}</span>
              <StatusBadge status={z.operationalStatus || 'OPERATIONAL'} size="sm" />
            </div>
            <h4 className="text-sm font-bold text-[#F0F4F8] mb-1">{z.name}</h4>
            <p className="text-[11px] text-[#8C9BAE] mb-3 leading-relaxed">
              {z.description || 'Pressurized lunar biome sector.'}
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-[#1E2638] pt-2.5 text-[#8C9BAE]">
              <div>PRESSURE: <span className="text-[#F0F4F8] font-semibold">{z.targetPressureKpa || 101.3} kPa</span></div>
              <div>MAX CO₂: <span className="text-[#F0F4F8] font-semibold">{z.maxCo2Ppm || 950} ppm</span></div>
              <div>VOLUME: <span className="text-[#F0F4F8] font-semibold">{z.totalVolumeM3 || 4500} m³</span></div>
              <div>OCCUPANCY: <span className="text-[#06B6D4] font-semibold">{z.occupancyCount || 4} CREW</span></div>
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
