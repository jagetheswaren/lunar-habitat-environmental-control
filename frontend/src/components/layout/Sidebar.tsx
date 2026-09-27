import React from 'react';
import {
  LayoutDashboard,
  Box,
  Radio,
  BellRing,
  Sliders,
  Globe2,
  Boxes,
  Wrench,
  Users,
  Package,
  ShoppingBag,
  Receipt,
  FileSpreadsheet,
  FileCheck,
  CreditCard,
  BookOpen,
  Layers,
  FileText,
  PieChart,
  Calculator,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  userRole?: string;
}

export const Sidebar: React.FC<Props> = ({ currentPath, onNavigate }) => {
  const sections = [
    {
      title: 'MISSION',
      items: [
        { name: 'Mission Control', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Digital Twin 3D', path: '/digital-twin', icon: Box },
        { name: 'Live Telemetry', path: '/telemetry', icon: Radio },
        { name: 'Alerts & Incidents', path: '/alerts', icon: BellRing },
      ],
    },
    {
      title: 'LIFE SUPPORT',
      items: [
        { name: 'Resource Reclamation', path: '/reclamation', icon: RefreshCw },
        { name: 'Atmospheric Rules', path: '/thresholds', icon: Sliders },
        { name: 'Habitat Sectors', path: '/zones', icon: Globe2 },
        { name: 'Resource Reserves', path: '/inventory', icon: Boxes },
        { name: 'Life Support Maint.', path: '/maintenance', icon: Wrench },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Entity Directory', path: '/contacts', icon: Users },
        { name: 'Resource Catalog', path: '/products', icon: Package },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag },
        { name: 'Vendor Bills', path: '/vendor-bills', icon: Receipt },
        { name: 'Sales Orders', path: '/sales-orders', icon: FileSpreadsheet },
        { name: 'Customer Invoices', path: '/invoices', icon: FileCheck },
        { name: 'Payments', path: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Chart of Accounts', path: '/accounts', icon: BookOpen },
        { name: 'Journal Types', path: '/journals', icon: Layers },
        { name: 'General Ledger', path: '/journal-entries', icon: FileText },
        { name: 'Cost Centers', path: '/analytic-accounts', icon: PieChart },
        { name: 'Budgets', path: '/budgets', icon: Calculator },
        { name: 'Reports & Intelligence', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Security Audit Trail', path: '/audit-logs', icon: ShieldCheck },
        { name: 'Access & User Admin', path: '/users', icon: UserCheck },
        { name: 'Console Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-[230px] bg-[#10151D] border-r border-[#273142] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-3 border-b border-[#273142] flex items-center justify-between bg-[#080B10]/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#151B24] border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4]">
            <Globe2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-[#F2F5F7] font-mono uppercase">
              LUNAR HABITAT
            </h1>
            <p className="text-[9px] text-[#06B6D4] font-mono tracking-wider uppercase leading-none">
              OPERATIONS CONSOLE
            </p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Local node operational" />
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-3.5">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2 mb-1 text-[9px] font-mono font-bold tracking-widest text-[#667085] uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={iIdx}
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-mono transition-all text-left ${
                      isActive
                        ? 'border-l-2 border-[#06B6D4] bg-[#151B24] text-[#F2F5F7] font-semibold pl-2'
                        : 'border-l-2 border-transparent text-[#98A2B3] hover:text-[#F2F5F7] hover:bg-[#151B24]/70 pl-2'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#06B6D4]' : 'text-[#667085]'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* External Swagger Link */}
        <div className="pt-2 border-t border-[#273142] px-1">
          <a
            href={(import.meta.env.VITE_API_URL || '') + '/swagger-ui/index.html'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2 py-1.5 rounded-sm text-xs font-mono text-[#98A2B3] hover:text-[#06B6D4] hover:bg-[#151B24] transition-colors border border-[#273142]"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Swagger API
            </span>
            <ExternalLink className="w-3 h-3 text-[#667085]" />
          </a>
        </div>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-2 border-t border-[#273142] bg-[#080B10] text-[10px] font-mono text-[#98A2B3] flex items-center justify-between">
        <span className="text-[#667085]">{import.meta.env.PROD ? 'PROD CLUSTER' : 'DEV CLUSTER'}</span>
        <span className="flex items-center gap-1.5 text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          SYS SYNCED
        </span>
      </div>
    </aside>
  );
};
