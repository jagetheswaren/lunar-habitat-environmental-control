import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import * as T from '../api/types';
import { LunarDome3D } from '../components/3d/LunarDome3D';
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
} from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const [zones, setZones] = useState<T.HabitatZone[]>([]);
  const [telemetry, setTelemetry] = useState<T.Telemetry[]>([]);
  const [alerts, setAlerts] = useState<T.EnvironmentalAlert[]>([]);
  const [maintenance, setMaintenance] = useState<T.MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('dome-alpha');
  const [fullTacticalMode, setFullTacticalMode] = useState<boolean>(false);

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
      console.error('Failed to load Digital Twin telemetry', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const latestTelemetry = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  // Active module mapping
  const zoneMapping: Record<string, { code: string; defaultName: string; sector: string }> = {
    'dome-alpha': { code: 'DOME-ALPHA', defaultName: 'Habitat Dome Alpha', sector: 'SECTOR-01-CREW' },
    'dome-beta': { code: 'DOME-BETA', defaultName: 'Hydroponics Dome Beta', sector: 'SECTOR-02-AGRI' },
    'sector-gamma': { code: 'SECTOR-GAMMA', defaultName: 'Life Support Reclamation Gamma', sector: 'SECTOR-03-ECLSS' },
    'grid-delta': { code: 'GRID-DELTA', defaultName: 'Solar Array & Power Hub Delta', sector: 'SECTOR-04-ENERGY' },
  };

  const currentMeta = zoneMapping[selectedModuleId] || zoneMapping['dome-alpha'];
  const matchedZone = zones.find(z => z.code === currentMeta.code || z.name?.toLowerCase().includes(selectedModuleId.split('-')[1]));

  // Telemetry for selected module
  const zoneTelemetry = telemetry.filter(t => t.habitatZone?.code === currentMeta.code || t.habitatZone?.id === matchedZone?.id);
  const currentZoneLatest = zoneTelemetry.length > 0 ? zoneTelemetry[zoneTelemetry.length - 1] : latestTelemetry;

  // Alerts for selected module
  const zoneAlerts = alerts.filter(a => a.habitatZone?.code === currentMeta.code || a.habitatZone?.id === matchedZone?.id);
  const activeZoneAlerts = zoneAlerts.filter(a => a.status !== 'RESOLVED');

  // Maintenance for selected module
  const zoneMaintenance = maintenance.filter(m => m.equipmentName?.toLowerCase().includes(selectedModuleId.split('-')[1]) || m.equipmentName?.includes(currentMeta.code));

  // Determine module status
  const currentStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    activeZoneAlerts.some(a => a.severity === 'CRITICAL')
      ? 'CRITICAL'
      : activeZoneAlerts.length > 0
      ? 'WARNING'
      : 'NOMINAL';

  const handleAcknowledgeAlert = async (id: number) => {
    try {
      await api.alerts.acknowledge(id, 'Acknowledged via 3D Digital Twin inspection terminal');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await api.alerts.resolve(id, 'Resolved via 3D Digital Twin inspection terminal');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="3D Habitat Digital Twin"
        subtitle="WebGL Telemetry Mesh • Spatial Asset Inspection • Real-time Hardware Twin"
        icon={Box}
        badge="REALTIME SYNC"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#06B6D4]' : ''}`} />
              SYNC TWIN
            </button>
            <button
              onClick={() => setFullTacticalMode(!fullTacticalMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#1E2638] bg-[#111622] text-[#8C9BAE] hover:text-[#F0F4F8] hover:border-[#06B6D4]/40 transition-colors"
            >
              {fullTacticalMode ? <Minimize2 className="w-3.5 h-3.5 text-[#06B6D4]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#06B6D4]" />}
              {fullTacticalMode ? 'RESTORE VIEW' : 'EXPAND TWIN'}
            </button>
          </div>
        }
      />

      {/* Main 3D Canvas Viewport */}
      <div className={`transition-all duration-200 ${fullTacticalMode ? 'h-[620px]' : 'h-[460px]'}`}>
        <LunarDome3D
          status={currentStatus === 'CRITICAL' ? 'CRITICAL' : currentStatus === 'WARNING' ? 'WARNING' : 'NORMAL'}
          zoneName={matchedZone?.name || currentMeta.defaultName}
          co2Level={currentZoneLatest ? Number(currentZoneLatest.co2LevelPpm) : 428}
          pressure={currentZoneLatest ? Number(currentZoneLatest.atmosphericPressureKpa) : 101.32}
          waterPurity={currentZoneLatest ? Number(currentZoneLatest.waterPurityPercent) : 99.4}
          temperature={currentZoneLatest ? Number(currentZoneLatest.temperatureCelsius) : 22.1}
          humidity={currentZoneLatest ? Number(currentZoneLatest.humidityPercent) : 46}
          onSelectModule={(id) => setSelectedModuleId(id)}
        />
      </div>

      {/* Module Inspection Terminal (Phase 18 Requirements) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module Telemetry Dossier */}
        <div className="bg-[#111622] border border-[#1E2638] rounded p-4 font-mono text-xs text-[#F0F4F8]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-bold uppercase tracking-wider text-[#F0F4F8]">
                {currentMeta.code} TELEMETRY DOSSIER
              </span>
            </div>
            <StatusBadge status={currentStatus} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Zone Name:</span>
              <span className="font-semibold text-[#F0F4F8]">{matchedZone?.name || currentMeta.defaultName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Zone Code:</span>
              <span className="font-semibold text-[#06B6D4]">{currentMeta.code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Sector Designation:</span>
              <span className="text-[#F0F4F8]">{currentMeta.sector}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Atmospheric Pressure:</span>
              <span className="tabular-nums font-semibold text-[#06B6D4]">
                {currentZoneLatest?.atmosphericPressureKpa ? `${Number(currentZoneLatest.atmosphericPressureKpa).toFixed(1)} kPa` : '101.3 kPa'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">CO₂ Concentration:</span>
              <span className={`tabular-nums font-semibold ${
                (currentZoneLatest?.co2LevelPpm || 428) > 950 ? 'text-[#EF4444]' : (currentZoneLatest?.co2LevelPpm || 428) > 800 ? 'text-[#F59E0B]' : 'text-[#10B981]'
              }`}>
                {currentZoneLatest?.co2LevelPpm ? `${Number(currentZoneLatest.co2LevelPpm).toFixed(0)} ppm` : '428 ppm'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Thermal Equilibrium:</span>
              <span className="tabular-nums text-[#F0F4F8]">
                {currentZoneLatest?.temperatureCelsius ? `${Number(currentZoneLatest.temperatureCelsius).toFixed(1)} °C` : '22.1 °C'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Relative Humidity:</span>
              <span className="tabular-nums text-[#F0F4F8]">
                {currentZoneLatest?.humidityPercent ? `${Number(currentZoneLatest.humidityPercent).toFixed(0)} %` : '46 %'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Water Loop Purity:</span>
              <span className="tabular-nums font-semibold text-[#10B981]">
                {currentZoneLatest?.waterPurityPercent ? `${Number(currentZoneLatest.waterPurityPercent).toFixed(1)} %` : '99.4 %'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1E2638]/50">
              <span className="text-[#8C9BAE]">Scrubber Automation:</span>
              <span className={`font-semibold ${
                (currentZoneLatest?.co2LevelPpm || 428) > 950 ? 'text-[#F59E0B]' : 'text-[#10B981]'
              }`}>
                {(currentZoneLatest?.co2LevelPpm || 428) > 950 ? 'BOOST SCRUBBER ACTIVE' : 'NOMINAL RECIRCULATION'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8C9BAE]">Latest Reading UTC:</span>
              <span className="tabular-nums text-[#5A677B]">
                {currentZoneLatest?.recordedAt || 'REALTIME LOOP'}
              </span>
            </div>
          </div>
        </div>

        {/* Zone Open Alerts Panel */}
        <div className="bg-[#111622] border border-[#1E2638] rounded p-4 font-mono text-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-3.5 h-3.5 ${activeZoneAlerts.length > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`} />
              <span className="font-bold uppercase tracking-wider text-[#F0F4F8]">
                Zone Incident Status
              </span>
            </div>
            <span className="text-[10px] text-[#8C9BAE]">{activeZoneAlerts.length} ACTIVE</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pr-1">
            {activeZoneAlerts.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-7 h-7 text-[#10B981] mb-1.5" />
                <span className="font-bold text-[#F0F4F8] text-[11px] uppercase">
                  ZERO ACTIVE INCIDENTS
                </span>
                <span className="text-[10px] text-[#5A677B] mt-0.5">
                  Threshold compliance verified on {currentMeta.code}
                </span>
              </div>
            ) : (
              activeZoneAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded border ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                      : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase text-[10px]">{alert.alertType}</span>
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#F0F4F8] mb-2">{alert.message}</p>
                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#1E2638]">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-2 py-0.5 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] text-[10px] border border-[#F59E0B]/40"
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-2 py-0.5 rounded bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] text-[10px] border border-[#10B981]/40"
                    >
                      RESOLVE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone Maintenance & Actuators */}
        <div className="bg-[#111622] border border-[#1E2638] rounded p-4 font-mono text-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="font-bold uppercase tracking-wider text-[#F0F4F8]">
                Life Support Maintenance
              </span>
            </div>
            <span className="text-[10px] text-[#8C9BAE]">LOGS</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pr-1">
            {zoneMaintenance.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-7 h-7 text-[#06B6D4] mb-1.5" />
                <span className="font-bold text-[#F0F4F8] text-[11px] uppercase">
                  EQUIPMENT HEALTHY
                </span>
                <span className="text-[10px] text-[#5A677B] mt-0.5">
                  Scheduled PM cycles current for {currentMeta.code}
                </span>
              </div>
            ) : (
              zoneMaintenance.map(rec => (
                <div key={rec.id} className="p-2.5 rounded bg-[#0B0E14] border border-[#1E2638] text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#F0F4F8]">{rec.equipmentName}</span>
                    <StatusBadge status={rec.status} size="sm" />
                  </div>
                  <p className="text-[#8C9BAE] text-[10px] mb-1">{rec.technicianNotes || rec.taskType}</p>
                  <div className="flex items-center justify-between text-[9px] text-[#5A677B]">
                    <span>TASK: {rec.taskType}</span>
                    <span>SCHEDULED: {rec.scheduledDate ? new Date(rec.scheduledDate).toLocaleDateString() : 'PENDING'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
