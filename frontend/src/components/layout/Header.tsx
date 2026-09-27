import React, { useState, useEffect } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { api } from '../../api/client';

interface Props {
  currentPath: string;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ onLogout }) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState<number>(0);
  const userJson = localStorage.getItem('lunar_user');
  const user = userJson
    ? JSON.parse(userJson)
    : { username: 'ADMIN', fullName: 'Commander Vance', roles: ['ROLE_ADMIN'] };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${mins}:${secs}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await api.alerts.getAll();
        const active = alerts.filter(a => a.status !== 'RESOLVED');
        setUnresolvedAlertsCount(active.length);
      } catch {
        // Fallback silently if offline
      }
    };
    fetchAlerts();
    const alertInterval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(alertInterval);
  }, []);

  const missionStatus = unresolvedAlertsCount > 2 ? 'CRITICAL' : unresolvedAlertsCount > 0 ? 'WARNING' : 'NOMINAL';
  const missionColor =
    missionStatus === 'CRITICAL'
      ? 'text-[#EF4444]'
      : missionStatus === 'WARNING'
      ? 'text-[#F59E0B]'
      : 'text-[#10B981]';

  return (
    <header className="h-[54px] border-b border-[#283443] bg-[#0C1118] px-4 flex items-center justify-between sticky top-0 z-20 select-none font-mono text-xs">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-[#F1F4F6] tracking-widest uppercase">
          LUNAR HABITAT CONTROL
        </span>
      </div>

      {/* Center Operational Strip */}
      <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="text-[#657184]">MISSION</span>
          <span className={`font-bold ${missionColor}`}>{missionStatus}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#657184]">LINK</span>
          <span className="flex items-center gap-1.5 text-[#06B6D4] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#657184]">ACTIVE ALERTS</span>
          <span
            className={`font-bold tabular-nums ${
              unresolvedAlertsCount > 0 ? 'text-[#EF4444]' : 'text-[#98A3B3]'
            }`}
          >
            {String(unresolvedAlertsCount).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#657184]">SOL</span>
          <span className="text-[#F1F4F6] font-bold">0187</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#657184]">UTC</span>
          <span className="text-[#F1F4F6] font-bold tabular-nums">{utcTime || '14:32:18'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#657184]">OPERATOR</span>
          <span className="text-[#F1F4F6] font-bold">{user.username?.toUpperCase() || 'ADMIN'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="flex md:hidden items-center gap-1 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[#06B6D4] font-bold">LIVE</span>
        </div>

        <button
          onClick={onLogout}
          title="Sign out of mission console"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161F2A] border border-[#283443] text-[#98A3B3] hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] tracking-wider uppercase font-semibold">
            LOGOUT
          </span>
        </button>
      </div>
    </header>
  );
};
