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
  const statusColors = {
    ok: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    warning: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    critical: 'border-red-500/30 text-red-400 bg-red-500/10 animate-pulse',
    info: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  };

  const statusGlow = {
    ok: 'hover:border-emerald-500/50',
    warning: 'hover:border-amber-500/50',
    critical: 'hover:border-red-500/50 border-red-500/40',
    info: 'hover:border-cyan-500/50',
  };

  return (
    <div className={`lunar-glass-card rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${statusGlow[status]}`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-medium tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${statusColors[status]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-slate-400 font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle / Trend */}
      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span>{subtitle}</span>
          {trend && <span className="text-cyan-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};
