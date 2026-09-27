import React from 'react';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let colorClasses = 'bg-[#161F2A] text-[#98A3B3] border-[#283443]';
  let dotColor = 'bg-[#64748B]';
  let pulseDot = false;

  if (['ACTIVE', 'CRITICAL', 'OVERDUE', 'ERROR', 'FAILED'].includes(norm)) {
    colorClasses = 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/40';
    dotColor = 'bg-[#EF4444]';
    pulseDot = true;
  } else if (['WARNING', 'ACKNOWLEDGED', 'DRAFT', 'PENDING', 'STANDBY', 'DEGRADED'].includes(norm)) {
    colorClasses = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/40';
    dotColor = 'bg-[#F59E0B]';
  } else if (['RESOLVED', 'POSTED', 'PAID', 'CONFIRMED', 'NORMAL', 'NOMINAL', 'RECEIVED', 'OPERATIONAL', 'COMPLETED', 'ONLINE'].includes(norm)) {
    colorClasses = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40';
    dotColor = 'bg-[#10B981]';
  } else if (['INFO', 'INVOICED', 'RECORDED', 'LIVE'].includes(norm)) {
    colorClasses = 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/40';
    dotColor = 'bg-[#06B6D4]';
  } else if (['OFFLINE', 'DISABLED', 'CLOSED'].includes(norm)) {
    colorClasses = 'bg-[#161F2A] text-[#64748B] border-[#283443]';
    dotColor = 'bg-[#64748B]';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded font-mono font-semibold border ${colorClasses} ${padding} uppercase tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulseDot ? 'pulse-critical' : ''}`} />
      {norm}
    </span>
  );
};
