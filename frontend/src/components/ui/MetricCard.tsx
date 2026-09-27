import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: 'ok' | 'warning' | 'critical' | 'info';
  trend?: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  status = 'info',
  trend,
  subtitle,
}) => {
  const statusStyles = {
    ok: {
      badge: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
      dot: 'bg-[#10B981]',
      border: 'border-[#1E2638] hover:border-[#10B981]/40',
    },
    warning: {
      badge: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
      dot: 'bg-[#F59E0B]',
      border: 'border-[#F59E0B]/40 hover:border-[#F59E0B]/60',
    },
    critical: {
      badge: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/40 pulse-critical',
      dot: 'bg-[#EF4444] pulse-critical',
      border: 'border-[#EF4444]/50 hover:border-[#EF4444]',
    },
    info: {
      badge: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30',
      dot: 'bg-[#06B6D4]',
      border: 'border-[#1E2638] hover:border-[#06B6D4]/40',
    },
  };

  const current = statusStyles[status];

  return (
    <div className={`bg-[#111622] rounded p-3 border transition-colors ${current.border} font-mono relative select-none`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold tracking-wider text-[#8C9BAE] uppercase truncate">
          {title}
        </span>
        <div className={`p-1 rounded border ${current.badge}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Primary Value Readout */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xl font-bold tracking-tight text-[#F0F4F8] tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-[#8C9BAE] font-medium uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle / Threshold Target */}
      <div className="flex items-center justify-between text-[10px] text-[#5A677B] pt-1.5 border-t border-[#1E2638]">
        <span className="truncate">{subtitle || 'Nominal Range'}</span>
        {trend && <span className="text-[#06B6D4] text-[9px] font-semibold">{trend}</span>}
      </div>
    </div>
  );
};
