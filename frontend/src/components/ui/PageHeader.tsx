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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1E2638]">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded bg-[#111622] border border-[#1E2638] text-[#06B6D4] flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-mono tracking-tight text-[#F0F4F8] uppercase">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 uppercase">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8C9BAE] font-mono mt-0.5">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
};
