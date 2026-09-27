import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { LunarDome3D, ModuleData } from '../components/3d/LunarDome3D';
import { ModuleInspectorDrawer } from '../components/intelligence/ModuleInspectorDrawer';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Box,
  Radio,
  AlertTriangle,
  Wrench,
  CheckCircle,
  RefreshCw,
  Sliders,
  Maximize2,
  Minimize2,
  Camera,
  Layers,
} from 'lucide-react';

interface Props {
  onNavigate?: (path: string) => void;
}

export const DigitalTwinPage: React.FC<Props> = ({ onNavigate = () => {} }) => {
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [maintenance, setMaintenance] = useState<T.MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('dome-alpha');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [zList, tList, aList, mList] = await Promise.all([
        api.zones.getAll().catch(() => []),
        api.telemetry.getAll().catch(() => []),
        api.alerts.getAll().catch(() => []),
        api.maintenance.getAll().catch(() => []),
      ]);
      setZones(zList);
      setTelemetry(tList);
      setAlerts(aList);
      setMaintenance(mList);
    } catch (err) {
      console.error('Failed to load Digital Twin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const latestTelemetry = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED');

  const moduleDefinitions: Record<string, ModuleData> = {
    'dome-alpha': {
      id: 'dome-alpha',
      name: 'Habitat Dome Alpha',
      code: 'DOME-A01',
      sector: 'SECTOR-01-CREW',
      position: [-2.6, 0, -0.8],
      pressure: Number(latestTelemetry?.atmosphericPressureKpa || 101.325),
      oxygen: '21.0 %',
      co2: Number(latestTelemetry?.co2LevelPpm || 742),
      temperature: Number(latestTelemetry?.temperatureCelsius || 22.4),
      humidity: Number(latestTelemetry?.humidityPercent || 48),
      waterPurity: Number(latestTelemetry?.waterPurityPercent || 99.4),
      lifeSupport: 'OPERATIONAL',
      scrubber: latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'BOOST' : 'STANDBY',
      power: 'STABLE',
      status: latestTelemetry && latestTelemetry.co2LevelPpm > 950 ? 'CRITICAL' : 'NOMINAL',
      statusMessage: 'Primary residential enclosure. Atmospheric recycling active.',
    },
    'dome-beta': {
      id: 'dome-beta',
      name: 'Hydroponics Dome Beta',
      code: 'AGRI-B02',
      sector: 'SECTOR-02-AGRI',
      position: [2.5, 0, -1.2],
      pressure: 101.25,
      oxygen: '21.4 %',
      co2: 410,
      temperature: 23.5,
      humidity: 62,
      waterPurity: 99.8,
      lifeSupport: 'OPERATIONAL',
      scrubber: 'STANDBY',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Closed-loop crop cultivation and biogenic oxygen generation.',
    },
    'life-support': {
      id: 'life-support',
      name: 'Life Support Reclamation',
      code: 'ECLSS-G03',
      sector: 'SECTOR-03-ECLSS',
      position: [0, 0, 1.8],
      pressure: 101.4,
      oxygen: '20.9 %',
      co2: 380,
      temperature: 21.0,
      humidity: 42,
      waterPurity: 99.9,
      lifeSupport: 'OPERATIONAL',
      scrubber: 'ACTIVE',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Multi-stage catalytic scrubbers and electrochemical water purification.',
    },
    'power-plant': {
      id: 'power-plant',
      name: 'Nuclear & Solar Power Hub',
      code: 'PWR-D04',
      sector: 'SECTOR-04-ENERGY',
      position: [4.8, 0, 1.5],
      pressure: 100.0,
      oxygen: '20.5 %',
      co2: 350,
      temperature: 19.5,
      humidity: 35,
      waterPurity: 99.0,
      lifeSupport: 'OPERATIONAL',
      scrubber: 'STANDBY',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Micro-fission reactor core and dual bifacial photovoltaic tracking arrays.',
    },
    'airlock': {
      id: 'airlock',
      name: 'EVA Airlock & Logistics',
      code: 'EVA-E05',
      sector: 'SECTOR-05-LOGISTICS',
      position: [-4.2, 0, 1.2],
      pressure: 101.0,
      oxygen: '21.0 %',
      co2: 415,
      temperature: 20.2,
      humidity: 40,
      waterPurity: 99.2,
      lifeSupport: 'OPERATIONAL',
      scrubber: 'STANDBY',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Outer surface ingress/egress hyperbaric lock and suit re-charging.',
    },
    'storage': {
      id: 'storage',
      name: 'Resource Processing & Storage',
      code: 'STOR-F06',
      sector: 'SECTOR-06-RESERVES',
      position: [0, 0, -3.2],
      pressure: 101.1,
      oxygen: '21.2 %',
      co2: 420,
      temperature: 18.8,
      humidity: 38,
      waterPurity: 99.5,
      lifeSupport: 'OPERATIONAL',
      scrubber: 'STANDBY',
      power: 'STABLE',
      status: 'NOMINAL',
      statusMessage: 'Cryogenic liquid oxygen tanks and high-pressure potable water reservoirs.',
    },
  };

  const selectedModule = moduleDefinitions[selectedModuleId] || moduleDefinitions['dome-alpha'];

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      <PageHeader
        title="3D DIGITAL TWIN"
        subtitle="INTERACTIVE SPATIAL DIGITAL TWIN // SCADA STRUCTURAL TELEMETRY"
        icon={Box}
        badge="SCADA 3D"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-2.5 py-1.5 rounded bg-[#161F2A] hover:bg-[#1B2531] border border-[#283443] text-[#06B6D4] font-bold uppercase transition-colors"
            >
              OPEN INSPECTOR
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 rounded bg-[#161F2A] border border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6] transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {/* Main 3D Canvas Container */}
      <div className="bg-[#111820] border border-[#283443] rounded overflow-hidden flex flex-col h-[650px] relative">
        {/* Top Spatial HUD Bar */}
        <div className="p-2.5 bg-[#0C1118] border-b border-[#283443] flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#657184] uppercase mr-1">SECTORS:</span>
            {Object.keys(moduleDefinitions).map(mKey => {
              const m = moduleDefinitions[mKey];
              const isSelected = selectedModuleId === mKey;
              return (
                <button
                  key={mKey}
                  onClick={() => handleModuleClick(mKey)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors border ${
                    isSelected
                      ? 'bg-[#161F2A] border-[#06B6D4] text-[#06B6D4]'
                      : 'bg-[#111820] border-[#283443] text-[#98A3B3] hover:text-[#F1F4F6]'
                  }`}
                >
                  {m.code}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#657184]">
              SELECTED: <strong className="text-[#F1F4F6]">{selectedModule.name}</strong>
            </span>
            <span className="text-[#283443]">•</span>
            <StatusBadge status={selectedModule.status} size="sm" />
          </div>
        </div>

        {/* Central Three.js Scene */}
        <div className="flex-1 relative bg-[#080B10]">
          <LunarDome3D
            status={selectedModule.status === 'CRITICAL' ? 'CRITICAL' : selectedModule.status === 'WARNING' ? 'WARNING' : 'NORMAL'}
            zoneName={selectedModule.name}
            co2Level={selectedModule.co2}
            pressure={selectedModule.pressure}
            waterPurity={selectedModule.waterPurity}
            temperature={selectedModule.temperature}
            humidity={selectedModule.humidity}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleModuleClick}
          />

          {/* Technical HUD Corner Overlays */}
          <div className="absolute top-3 left-3 p-2.5 rounded bg-[#0C1118]/85 border border-[#283443] pointer-events-none space-y-1 text-[10px]">
            <span className="text-[9px] text-[#657184] uppercase block font-bold">
              SPATIAL TELEMETRY OVERLAY
            </span>
            <div className="text-[#98A3B3]">
              SURFACE ELEVATION: <span className="text-[#F1F4F6]">0.00 M (MARE TRANQUILLITATIS)</span>
            </div>
            <div className="text-[#98A3B3]">
              INTER-MODULE PIPELINES: <span className="text-[#10B981]">PRESSURE REGULATED</span>
            </div>
            <div className="text-[#98A3B3]">
              SOLAR TRACKING: <span className="text-[#06B6D4]">AZIMUTH 142.8°</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded bg-[#0C1118]/85 border border-[#283443] text-[10px] text-[#98A3B3]">
            CLICK ANY DOME, AIRLOCK, OR STORAGE SILO TO FOCUS & INSPECT
          </div>
        </div>
      </div>

      {/* Module Inspector Drawer */}
      <ModuleInspectorDrawer
        module={selectedModule}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={onNavigate}
        unresolvedAlertsCount={activeAlerts.length}
      />
    </div>
  );
};
