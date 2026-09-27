import React from 'react';
import {
  LayoutDashboard,
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
  ChevronDown,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  userRole?: string;
}

export const Sidebar: React.FC<Props> = ({ currentPath, onNavigate, userRole = 'ROLE_ADMIN' }) => {
  const sections = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Mission Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Telemetry Stream', path: '/telemetry', icon: Radio },
        { name: 'Environmental Alerts', path: '/alerts', icon: BellRing },
        { name: 'Threshold Rules', path: '/thresholds', icon: Sliders },
        { name: 'Habitat Zones', path: '/zones', icon: Globe2 },
        { name: 'Resource Inventory', path: '/inventory', icon: Boxes },
        { name: 'Life Support Maint.', path: '/maintenance', icon: Wrench },
      ],
    },
    {
      title: 'COMMERCIAL',
      items: [
        { name: 'Entity Contacts', path: '/contacts', icon: Users },
        { name: 'Resource Catalog', path: '/products', icon: Package },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag },
        { name: 'Vendor Bills', path: '/vendor-bills', icon: Receipt },
        { name: 'Sales Orders', path: '/sales-orders', icon: FileSpreadsheet },
        { name: 'Customer Invoices', path: '/invoices', icon: FileCheck },
        { name: 'Payment Transactions', path: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'FINANCE & GENERAL LEDGER',
      items: [
        { name: 'Chart of Accounts', path: '/accounts', icon: BookOpen },
        { name: 'Journal Types', path: '/journals', icon: Layers },
        { name: 'Journal Entries (GL)', path: '/journal-entries', icon: FileText },
        { name: 'Cost Centers (Analytic)', path: '/analytic-accounts', icon: PieChart },
        { name: 'Operational Budgets', path: '/budgets', icon: Calculator },
      ],
    },
    {
      title: 'REPORTS & INTELLIGENCE',
      items: [
        { name: 'Financial & Eco Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { name: 'Security Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        { name: 'Access & User Admin', path: '/users', icon: UserCheck },
        { name: 'Console Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-space-900/90 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Globe2 className="w-5 h-5 text-space-950 font-bold" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
            LUNAR HABITAT
          </h1>
          <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
            OPS CONSOLE v2.0
          </p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2 mb-2 text-[10px] font-mono font-semibold tracking-widest text-slate-500 uppercase">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={iIdx}
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* External Swagger Link */}
        <div className="pt-2 border-t border-slate-800/80 px-2">
          <a
            href="http://localhost:8081/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors border border-slate-800"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Swagger OpenAPI
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-space-950/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>PORT: 8081 REST</span>
        <span className="text-emerald-400">ONLINE</span>
      </div>
    </aside>
  );
};
