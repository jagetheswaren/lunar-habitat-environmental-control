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
    <aside className="w-60 bg-[#0B0E14] border-r border-[#1E2638] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[#1E2638] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#111622] border border-[#06B6D4]/40 flex items-center justify-center text-[#06B6D4]">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest text-[#F0F4F8] font-mono uppercase">
              LUNAR HABITAT
            </h1>
            <p className="text-[10px] text-[#06B6D4] font-mono tracking-wider uppercase">
              MISSION OPS V2.1
            </p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Local node operational" />
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2 mb-1 text-[9px] font-mono font-bold tracking-widest text-[#5A677B] uppercase">
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono transition-all text-left ${
                      isActive
                        ? 'bg-[#161D2B] text-[#06B6D4] font-semibold border border-[#06B6D4]/40'
                        : 'text-[#8C9BAE] hover:text-[#F0F4F8] hover:bg-[#111622] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#06B6D4]' : 'text-[#5A677B]'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* External Swagger Link */}
        <div className="pt-2 border-t border-[#1E2638] px-1">
          <a
            href={(import.meta.env.VITE_API_URL || '') + '/swagger-ui/index.html'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono text-[#8C9BAE] hover:text-[#06B6D4] hover:bg-[#111622] transition-colors border border-[#1E2638]"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Swagger OpenAPI
            </span>
            <ExternalLink className="w-3 h-3 text-[#5A677B]" />
          </a>
        </div>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-2.5 border-t border-[#1E2638] bg-[#070A0F] text-[10px] font-mono text-[#8C9BAE] flex items-center justify-between">
        <span className="text-[#5A677B]">{import.meta.env.PROD ? 'PROD CLUSTER' : 'DEV CLUSTER'}</span>
        <span className="flex items-center gap-1.5 text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          SYS SYNCED
        </span>
      </div>
    </aside>
  );
};
