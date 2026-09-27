import React from 'react';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['ACTIVE', 'CRITICAL', 'OVERDUE', 'ERROR'].includes(norm)) {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse';
  } else if (['WARNING', 'ACKNOWLEDGED', 'DRAFT', 'PENDING'].includes(norm)) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (['RESOLVED', 'POSTED', 'PAID', 'CONFIRMED', 'NORMAL', 'RECEIVED', 'OPERATIONAL', 'COMPLETED'].includes(norm)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (['INFO', 'INVOICED', 'RECORDED'].includes(norm)) {
    colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border ${colorClasses} ${padding}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {norm}
    </span>
  );
};
