import React from 'react';
import { Drawer } from '../ui/Drawer';
import { StatusBadge } from '../ui/StatusBadge';
import { Activity, Wind, Droplets, Thermometer, Radio, Wrench, BellRing, Gauge } from 'lucide-react';
import { ModuleData } from '../3d/LunarDome3D';

interface Props {
  module: ModuleData | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  unresolvedAlertsCount?: number;
}

export const ModuleInspectorDrawer: React.FC<Props> = ({
  module,
  isOpen,
  onClose,
  onNavigate,
  unresolvedAlertsCount = 0,
}) => {
  if (!module) return null;

  const badgeType =
    module.status === 'CRITICAL'
      ? 'critical'
      : module.status === 'WARNING'
      ? 'warning'
      : 'nominal';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={module.name}
      subtitle={`MODULE ID: ${module.code} // ${module.sector}`}
      badge={module.status}
      badgeType={badgeType}
      width="w-full max-w-md sm:max-w-lg"
      footer={
        <div className="flex items-center gap-2 w-full justify-between font-mono text-[11px]">
          <span className="text-[#657184] uppercase">SUBSYSTEM: {module.code}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate('/telemetry');
              }}
              className="px-2.5 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] text-[#06B6D4] border border-[#283443] hover:border-[#06B6D4]/40 font-bold uppercase transition-colors"
            >
              OPEN TELEMETRY
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('/maintenance');
              }}
              className="px-2.5 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] text-[#F1F4F6] border border-[#283443] hover:border-[#F1F4F6]/40 font-bold uppercase transition-colors"
            >
              MAINTENANCE
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('/alerts');
              }}
              className="px-2.5 py-1.5 rounded bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40 font-bold uppercase transition-colors"
            >
              INCIDENTS
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Status Strip */}
        <div className="p-3 bg-[#0C1118] border border-[#283443] rounded flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#657184] uppercase tracking-wider block">STATUS</span>
            <span className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wide">
              {module.status === 'NOMINAL' ? 'OPERATIONAL' : module.status}
            </span>
          </div>
          <StatusBadge status={module.status} size="md" />
        </div>

        {/* Section: ENVIRONMENT */}
        <div className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-[11px] font-bold text-[#98A3B3] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
              ENVIRONMENTAL READINGS
            </span>
            <span className="text-[10px] text-[#10B981] font-semibold">CALIBRATED</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Pressure */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">Pressure</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">
                {Number(module.pressure).toFixed(3)}
              </span>
              <span className="text-[10px] text-[#98A3B3] ml-1">kPa</span>
            </div>

            {/* CO2 */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">CO2</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  module.co2 > 1000 ? 'text-[#EF4444]' : module.co2 > 800 ? 'text-[#F59E0B]' : 'text-[#F1F4F6]'
                }`}
              >
                {Math.round(module.co2)}
              </span>
              <span className="text-[10px] text-[#98A3B3] ml-1">ppm</span>
            </div>

            {/* Oxygen */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">Oxygen</span>
              <span className="text-sm font-bold text-[#10B981] tabular-nums">21.0</span>
              <span className="text-[10px] text-[#98A3B3] ml-1">%</span>
            </div>

            {/* Temperature */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">Temperature</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">
                {Number(module.temperature).toFixed(1)}
              </span>
              <span className="text-[10px] text-[#98A3B3] ml-1">°C</span>
            </div>

            {/* Humidity */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">Humidity</span>
              <span className="text-sm font-bold text-[#F1F4F6] tabular-nums">
                {Math.round(module.humidity)}
              </span>
              <span className="text-[10px] text-[#98A3B3] ml-1">%</span>
            </div>

            {/* Water Purity */}
            <div className="p-2 bg-[#111820] border border-[#283443] rounded">
              <span className="text-[10px] text-[#657184] uppercase block">Water Purity</span>
              <span className="text-sm font-bold text-[#06B6D4] tabular-nums">
                {Number(module.waterPurity).toFixed(1)}
              </span>
              <span className="text-[10px] text-[#98A3B3] ml-1">%</span>
            </div>
          </div>
        </div>

        {/* Section: SYSTEM */}
        <div className="bg-[#0C1118] border border-[#283443] rounded p-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#283443]">
            <span className="text-[11px] font-bold text-[#98A3B3] uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#F59E0B]" />
              SYSTEM DIAGNOSTICS
            </span>
          </div>

          <div className="divide-y divide-[#283443] text-[11px]">
            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#657184] uppercase">Scrubber Subsystem</span>
              <span
                className={`font-bold uppercase ${
                  module.scrubber === 'BOOST'
                    ? 'text-[#EF4444]'
                    : module.scrubber === 'HIGH_INTENSITY'
                    ? 'text-[#F59E0B]'
                    : 'text-[#10B981]'
                }`}
              >
                {module.scrubber || 'STANDBY'}
              </span>
            </div>

            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#657184] uppercase">Open Alerts</span>
              <span className="font-bold tabular-nums text-[#F1F4F6]">
                {unresolvedAlertsCount}
              </span>
            </div>

            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#657184] uppercase">Maintenance Posture</span>
              <span className="font-bold text-[#10B981] uppercase">NOMINAL</span>
            </div>

            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#657184] uppercase">Power Bus</span>
              <span className="font-bold text-[#10B981] uppercase">{module.power || 'STABLE'}</span>
            </div>

            <div className="py-1.5 flex items-center justify-between">
              <span className="text-[#657184] uppercase">Last Telemetry Packet</span>
              <span className="font-bold tabular-nums text-[#98A3B3]">
                {new Date().toISOString().substring(11, 19)} UTC
              </span>
            </div>
          </div>
        </div>

        {/* Technical Status Message */}
        <div className="p-2.5 bg-[#161F2A] border border-[#283443] rounded text-[11px] text-[#98A3B3]">
          <span className="text-[#657184] uppercase block text-[10px] mb-0.5">
            DIAGNOSTIC NOTICE:
          </span>
          {module.statusMessage || 'All life support and atmospheric reclamation loops operating within nominal bounds.'}
        </div>
      </div>
    </Drawer>
  );
};
