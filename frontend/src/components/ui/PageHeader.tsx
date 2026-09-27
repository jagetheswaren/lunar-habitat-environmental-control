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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#283443] font-mono">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-7 h-7 rounded bg-[#161F2A] border border-[#283443] text-[#06B6D4] flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-wider text-[#F1F4F6] uppercase">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#98A3B3] tracking-wide uppercase mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
};
