import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Drawer } from '../components/ui/Drawer';
import { Globe2, RefreshCw, Users, Box, Wind, ShieldCheck } from 'lucide-react';

export const HabitatZonesPage: React.FC = () => {
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<T.HabitatZone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchZones = async () => {
    try {
      const data = await api.zones.getAll();
      setZones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const columns: Column<T.HabitatZone>[] = [
    {
      header: 'CODE',
      render: r => (
        <span className="font-bold text-[#06B6D4]">
          {r.code}
        </span>
      ),
      accessorKey: 'code',
    },
    {
      header: 'HABITAT MODULE',
      render: r => (
        <div>
          <span className="font-bold text-[#F1F4F6] block">{r.name}</span>
          <span className="text-[10px] text-[#657184] truncate block max-w-sm">{r.description || 'Closed-loop sector'}</span>
        </div>
      ),
      accessorKey: 'name',
    },
    {
      header: 'TARGET PRESSURE',
      render: r => (
        <span className="tabular-nums text-[#F1F4F6]">
          {r.targetPressureKpa ?? 101.3} kPa
        </span>
      ),
      align: 'right',
    },
    {
      header: 'MAX CO2 LIMIT',
      render: r => (
        <span className="tabular-nums font-bold text-[#F59E0B]">
          {r.maxCo2Ppm ?? 800} ppm
        </span>
      ),
      align: 'right',
    },
    {
      header: 'MIN WATER PURITY',
      render: r => (
        <span className="tabular-nums text-[#06B6D4]">
          {r.minWaterPurityPercent ?? 98.0}%
        </span>
      ),
      align: 'right',
    },
    {
      header: 'OCCUPANCY',
      render: r => (
        <span className="flex items-center gap-1.5 text-[#98A3B3]">
          <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
          <strong className="text-[#F1F4F6] tabular-nums">{r.occupancyCount ?? 6}</strong> CREW
        </span>
      ),
    },
    {
      header: 'STATUS',
      render: r => <StatusBadge status={r.operationalStatus || 'OPERATIONAL'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="HABITAT MODULES & PRESSURIZED SECTORS"
        subtitle="PHYSICAL ENCLOSURES // ENVIRONMENTAL ENVELOPES & OCCUPANCY CAPACITY"
        icon={Globe2}
        badge="PRESSURIZED BIOMES"
        actions={
          <button
            onClick={() => {
              setRefreshing(true);
              fetchZones();
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
        data={zones}
        loading={loading}
        emptyMessage="NO HABITAT MODULES DEFINED"
        searchable
        searchPlaceholder="SEARCH HABITAT MODULES (CODE, NAME)..."
        onRowClick={row => {
          setSelectedZone(row);
          setIsDrawerOpen(true);
        }}
        selectedRowId={selectedZone?.id}
        pageSize={20}
      />

      {/* Module Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedZone?.name || 'HABITAT MODULE'}
        subtitle={`MODULE ID: ${selectedZone?.code || 'DOME-A01'} // OCCUPANCY: ${selectedZone?.occupancyCount ?? 6} CREW`}
        badge={selectedZone?.operationalStatus || 'OPERATIONAL'}
        badgeType="nominal"
        footer={
          <div className="flex items-center justify-between w-full text-[11px]">
            <span className="text-[#657184]">ZONE ID: #{selectedZone?.id}</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#F1F4F6] font-bold uppercase"
            >
              CLOSE
            </button>
          </div>
        }
      >
        {selectedZone && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-2">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                ENVIRONMENTAL ENVELOPE BASELINES
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-[#657184] block">TARGET BAROMETRIC PRESSURE</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">
                    {selectedZone.targetPressureKpa ?? 101.325} kPa
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">MAXIMUM CO2 CEILING</span>
                  <span className="font-bold text-[#F59E0B] tabular-nums">
                    {selectedZone.maxCo2Ppm ?? 800} ppm
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">MINIMUM POTABLE PURITY</span>
                  <span className="font-bold text-[#06B6D4] tabular-nums">
                    {selectedZone.minWaterPurityPercent ?? 98.0}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#657184] block">ACTIVE OCCUPANCY</span>
                  <span className="font-bold text-[#F1F4F6] tabular-nums">
                    {selectedZone.occupancyCount ?? 6} Astronauts
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0C1118] border border-[#283443] rounded space-y-1.5">
              <span className="text-[10px] text-[#657184] uppercase font-bold block">
                SECTOR ARCHITECTURE & PURPOSE
              </span>
              <p className="text-[11px] text-[#98A3B3]">
                {selectedZone.description ||
                  'Pressurized titanium-composite dome structural shell providing closed-loop environmental life support.'}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
