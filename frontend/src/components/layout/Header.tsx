import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Shield, Bell, Wifi, Radio } from 'lucide-react';
import { api } from '../../api/client';

interface Props {
  currentPath: string;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ currentPath, onLogout }) => {
  const [time, setTime] = useState<string>('');
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState<number>(0);
  const userJson = localStorage.getItem('lunar_user');
  const user = userJson ? JSON.parse(userJson) : { username: 'admin', fullName: 'Commander Alex Vance', roles: ['ROLE_ADMIN'] };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
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
    const alertInterval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(alertInterval);
  }, []);

  const routeTitles: Record<string, { title: string; section: string }> = {
    '/dashboard': { title: 'Mission Control Console', section: 'MISSION' },
    '/digital-twin': { title: '3D Habitat Digital Twin', section: 'MISSION' },
    '/telemetry': { title: 'Telemetry Log & Sensor Stream', section: 'MISSION' },
    '/alerts': { title: 'Environmental Incident Governance', section: 'MISSION' },
    '/thresholds': { title: 'Atmospheric Safety Rules', section: 'LIFE SUPPORT' },
    '/zones': { title: 'Habitat Atmospheric Sectors', section: 'LIFE SUPPORT' },
    '/inventory': { title: 'Resource Reserves & Buffers', section: 'LIFE SUPPORT' },
    '/maintenance': { title: 'Life Support Maintenance', section: 'LIFE SUPPORT' },
    '/contacts': { title: 'Entity & Partner Directory', section: 'OPERATIONS' },
    '/products': { title: 'Resource & Consumable Catalog', section: 'OPERATIONS' },
    '/purchase-orders': { title: 'Procurement Purchase Orders', section: 'OPERATIONS' },
    '/vendor-bills': { title: 'Vendor Bills & Invoices', section: 'OPERATIONS' },
    '/sales-orders': { title: 'Commercial Sales Orders', section: 'OPERATIONS' },
    '/invoices': { title: 'Customer Invoices & Billing', section: 'OPERATIONS' },
    '/payments': { title: 'Payment Transactions', section: 'OPERATIONS' },
    '/accounts': { title: 'Chart of Accounts (Double-Entry)', section: 'FINANCE' },
    '/journals': { title: 'Financial Journal Types', section: 'FINANCE' },
    '/journal-entries': { title: 'General Ledger Journal Entries', section: 'FINANCE' },
    '/analytic-accounts': { title: 'Analytic Cost Centers', section: 'FINANCE' },
    '/budgets': { title: 'Operational Budgets & Allocations', section: 'FINANCE' },
    '/reports': { title: 'Mission Intelligence & Financial Reports', section: 'FINANCE' },
    '/audit-logs': { title: 'Immutable Security Audit Logs', section: 'SYSTEM' },
    '/users': { title: 'Security & Access Administration', section: 'SYSTEM' },
    '/settings': { title: 'Mission Console Configuration', section: 'SYSTEM' },
  };

  const currentRoute = routeTitles[currentPath] || { title: 'Lunar Mission Operations', section: 'MISSION' };

  return (
    <header className="h-[54px] border-b border-[#273142] bg-[#10151D]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 select-none font-mono text-xs">
      {/* Brand & Mission Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F2F5F7] tracking-wider uppercase text-xs">
            LUNAR HABITAT CONTROL
          </span>
          <span className="text-[#273142]">•</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              unresolvedAlertsCount > 0
                ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                : 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
            }`}
          >
            {unresolvedAlertsCount > 0 ? 'WARNING' : 'NOMINAL'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#667085] text-[11px]">
          <span>/</span>
          <span className="text-[#98A2B3] tracking-wide uppercase">{currentRoute.title}</span>
        </div>
      </div>

      {/* Center Operational Console Strip */}
      <div className="hidden lg:flex items-center gap-4 text-[11px]">
        {/* Realtime Link */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151B24] border border-[#273142] text-[#98A2B3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>LINK: <span className="text-[#06B6D4] font-semibold">LIVE</span></span>
        </div>

        {/* Mission Time */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151B24] border border-[#273142] text-[#98A2B3]">
          <span className="text-[#F59E0B] font-semibold">SOL 0187</span>
          <span className="text-[#667085]">•</span>
          <span className="tabular-nums text-[#F2F5F7]">{time || '14:32:00 UTC'}</span>
        </div>

        {/* Open Alerts Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
            unresolvedAlertsCount > 0
              ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
              : 'bg-[#151B24] border-[#273142] text-[#98A2B3]'
          }`}
        >
          <Bell className={`w-3 h-3 ${unresolvedAlertsCount > 0 ? 'pulse-critical' : 'text-[#667085]'}`} />
          <span className="font-semibold tabular-nums">
            {String(unresolvedAlertsCount).padStart(2, '0')} ALERTS
          </span>
        </div>
      </div>

      {/* Current Operator & Logout */}
      <div className="flex items-center gap-2.5">
        {/* Operator Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#273142] bg-[#151B24]">
          <div className="w-4 h-4 rounded bg-[#19212C] border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
            <Shield className="w-2.5 h-2.5" />
          </div>
          <div className="text-left font-mono">
            <span className="text-xs font-semibold text-[#F2F5F7]">
              {user.username?.toUpperCase() || 'ADMIN'}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          title="Sign out of mission console"
          className="p-1.5 rounded border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 hover:border-[#EF4444]/40 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
