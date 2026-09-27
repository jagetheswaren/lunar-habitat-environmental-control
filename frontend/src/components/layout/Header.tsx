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
    <header className="h-14 border-b border-[#1E2638] bg-[#0B0E14]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Route & Mission Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#5A677B] tracking-wider uppercase font-semibold">
            {currentRoute.section}
          </span>
          <span className="text-[#1E2638]">/</span>
          <h2 className="font-bold text-[#F0F4F8] tracking-wide uppercase">
            {currentRoute.title}
          </h2>
        </div>
      </div>

      {/* Operational Telemetry Status Bar */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <Wifi className="w-3 h-3 text-[#10B981]" />
          <span>NET: <span className="text-[#10B981] font-semibold">ONLINE</span></span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <Radio className="w-3 h-3 text-[#06B6D4]" />
          <span>SSE: <span className="text-[#06B6D4] font-semibold">STREAMING</span></span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#111622] border border-[#1E2638] text-[#8C9BAE]">
          <span className="text-[#F59E0B] font-semibold">SOL 412</span>
          <span className="text-[#5A677B]">•</span>
          <span>LUNAR BASE ALPHA</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#8C9BAE]">
          <Clock className="w-3 h-3 text-[#06B6D4]" />
          <span className="tabular-nums">{time || 'UTC SYNCHRONIZING'}</span>
        </div>
      </div>

      {/* User profile, Alert counter & Sign-out */}
      <div className="flex items-center gap-2.5">
        {/* Alert quick status indicator */}
        <div
          title={unresolvedAlertsCount > 0 ? `${unresolvedAlertsCount} active alert(s)` : 'No active alerts'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono ${
            unresolvedAlertsCount > 0
              ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
              : 'bg-[#111622] border-[#1E2638] text-[#8C9BAE]'
          }`}
        >
          <Bell className={`w-3.5 h-3.5 ${unresolvedAlertsCount > 0 ? 'pulse-critical' : ''}`} />
          <span className="tabular-nums font-semibold">{unresolvedAlertsCount}</span>
        </div>

        {/* Operator Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#1E2638] bg-[#111622]">
          <div className="w-5 h-5 rounded bg-[#161D2B] border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
            <Shield className="w-3 h-3" />
          </div>
          <div className="text-left font-mono">
            <div className="text-xs font-semibold text-[#F0F4F8] leading-tight truncate max-w-[120px]">
              {user.fullName || user.username}
            </div>
            <div className="text-[9px] text-[#06B6D4] uppercase tracking-wider leading-none">
              {user.roles?.[0]?.replace('ROLE_', '') || 'OPERATOR'}
            </div>
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
