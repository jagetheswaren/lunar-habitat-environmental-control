import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  badge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl border border-cyan-500/20 bg-space-850 text-cyan-400 mt-1">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            {badge && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5 font-mono">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
};
