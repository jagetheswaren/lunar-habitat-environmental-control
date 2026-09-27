import React from 'react';
import {
  LayoutDashboard,
  Box,
  Radio,
  BellRing,
  Wind,
  Droplets,
  Activity,
  RefreshCw,
  Cpu,
  Wrench,
  Boxes,
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
  Calculator,
  BarChart3,
  Globe2,
  Sliders,
  UserCheck,
  ShieldCheck,
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
        { name: 'Digital Twin', path: '/digital-twin', icon: Box },
        { name: 'Telemetry', path: '/telemetry', icon: Radio },
        { name: 'Incidents', path: '/alerts', icon: BellRing },
      ],
    },
    {
      title: 'LIFE SUPPORT',
      items: [
        { name: 'Atmosphere', path: '/atmosphere', icon: Wind },
        { name: 'Oxygen', path: '/oxygen', icon: Activity },
        { name: 'Water', path: '/water', icon: Droplets },
        { name: 'Resource Reclamation', path: '/reclamation', icon: RefreshCw },
        { name: 'CO2 Scrubbers', path: '/scrubbers', icon: Cpu },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Inventory', path: '/inventory', icon: Boxes },
        { name: 'Contacts', path: '/contacts', icon: Users },
        { name: 'Products', path: '/products', icon: Package },
        { name: 'Procurement', path: '/purchase-orders', icon: ShoppingBag },
        { name: 'Vendor Bills', path: '/vendor-bills', icon: Receipt },
        { name: 'Sales', path: '/sales-orders', icon: FileSpreadsheet },
        { name: 'Invoices', path: '/invoices', icon: FileCheck },
        { name: 'Payments', path: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Accounts', path: '/accounts', icon: BookOpen },
        { name: 'Journals', path: '/journals', icon: Layers },
        { name: 'General Ledger', path: '/journal-entries', icon: FileText },
        { name: 'Budgets', path: '/budgets', icon: Calculator },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Habitat Modules', path: '/zones', icon: Globe2 },
        { name: 'Thresholds', path: '/thresholds', icon: Sliders },
        { name: 'Users', path: '/users', icon: UserCheck },
        { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-[230px] bg-[#111820] border-r border-[#283443] flex flex-col h-screen fixed left-0 top-0 z-30 select-none font-mono">
      {/* Brand Header */}
      <div className="p-3 border-b border-[#283443] bg-[#0C1118] flex items-center justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-[#F1F4F6] uppercase">
            LUNAR OPS
          </h1>
          <p className="text-[9px] text-[#06B6D4] tracking-wider uppercase font-semibold">
            ENVIRONMENTAL CONTROL
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#10B981]" title="Local node operational" />
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2.5 mb-1 text-[9px] font-bold tracking-widest text-[#657184] uppercase">
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs transition-colors text-left ${
                      isActive
                        ? 'border-l-2 border-[#06B6D4] bg-[#161F2A] text-[#F1F4F6] font-semibold pl-2'
                        : 'border-l-2 border-transparent text-[#98A3B3] hover:text-[#F1F4F6] hover:bg-[#161F2A]/60 pl-2'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isActive ? 'text-[#06B6D4]' : 'text-[#657184]'
                      }`}
                    />
                    <span className="truncate tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* External Swagger Link */}
        <div className="pt-2 border-t border-[#283443] px-1">
          <a
            href={(import.meta.env.VITE_API_URL || '') + '/swagger-ui/index.html'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2 py-1.5 text-xs text-[#98A3B3] hover:text-[#06B6D4] hover:bg-[#161F2A] transition-colors border border-[#283443] rounded-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Swagger API
            </span>
            <ExternalLink className="w-3 h-3 text-[#657184]" />
          </a>
        </div>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-2.5 border-t border-[#283443] bg-[#0C1118] text-[10px] text-[#98A3B3] flex items-center justify-between">
        <span className="text-[#657184] uppercase">
          {import.meta.env.PROD ? 'PROD CLUSTER' : 'DEV CLUSTER'}
        </span>
        <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          SYS SYNCED
        </span>
      </div>
    </aside>
  );
};
