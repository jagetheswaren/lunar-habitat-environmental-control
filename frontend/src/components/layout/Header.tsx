import React, { useState, useEffect } from 'react';
import { LogOut, User, Activity, Clock, Shield } from 'lucide-react';

interface Props {
  currentPath: string;
  onLogout: () => void;
}

export const Header: React.FC<Props> = ({ currentPath, onLogout }) => {
  const [time, setTime] = useState<string>('');
  const userJson = localStorage.getItem('lunar_user');
  const user = userJson ? JSON.parse(userJson) : { username: 'admin', fullName: 'Commander Alex Vance', roles: ['ROLE_ADMIN'] };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const routeTitles: Record<string, string> = {
    '/dashboard': 'Mission Control Dashboard',
    '/telemetry': 'Environmental Telemetry Stream',
    '/alerts': 'Active Alerts & Incident Governance',
    '/thresholds': 'Safety Threshold Protocols',
    '/zones': 'Habitat Atmospheric Sectors',
    '/inventory': 'Resource Buffer & Stock Movements',
    '/maintenance': 'Life Support Maintenance Records',
    '/contacts': 'Entity & Partner Directory',
    '/products': 'Resource & Consumable Catalog',
    '/purchase-orders': 'Procurement Purchase Orders',
    '/vendor-bills': 'Vendor Invoices & Bills',
    '/sales-orders': 'Commercial Sales Orders',
    '/invoices': 'Customer Invoices & Billing',
    '/payments': 'Financial Payment Records',
    '/accounts': 'Chart of Accounts (Double-Entry)',
    '/journals': 'Financial Journal Types',
    '/journal-entries': 'General Ledger Journal Entries',
    '/analytic-accounts': 'Analytic Cost Centers',
    '/budgets': 'Operational Budgets & Allocations',
    '/reports': 'Mission Intelligence & Financial Reports',
    '/audit-logs': 'Immutable Security Audit Logs',
    '/users': 'Security & Role Management',
    '/settings': 'Mission Control Console Settings',
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-space-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Route & Mission Status */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            {routeTitles[currentPath] || 'Lunar Mission Operations'}
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM SYNCHRONIZED
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-cyan-400" />
              {time || 'SYNCHRONIZING UTC...'}
            </span>
          </div>
        </div>
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-space-850">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-left font-mono">
            <div className="text-xs font-semibold text-white truncate max-w-[130px]">
              {user.fullName || user.username}
            </div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider">
              {user.roles?.[0]?.replace('ROLE_', '') || 'OPERATOR'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign out of mission console"
          className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
