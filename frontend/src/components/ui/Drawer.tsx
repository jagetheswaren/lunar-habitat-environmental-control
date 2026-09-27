import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'nominal' | 'warning' | 'critical' | 'neutral' | 'live';
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeType = 'neutral',
  children,
  width = 'w-full max-w-md sm:max-w-lg lg:max-w-xl',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const badgeColors = {
    nominal: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40',
    warning: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40',
    critical: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40',
    live: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40',
    neutral: 'bg-[#161F2A] text-[#98A3B3] border-[#283443]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={`${width} bg-[#111820] border-l border-[#283443] flex flex-col h-full shadow-2xl shadow-black/80 font-mono text-xs`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#0C1118] border-b border-[#283443] flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#F1F4F6] uppercase tracking-wider truncate">
                  {title}
                </h3>
                {badge && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badgeColors[badgeType]}`}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-[#657184] uppercase tracking-wider mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#98A3B3] hover:text-[#F1F4F6] hover:bg-[#161F2A] transition-colors border border-transparent hover:border-[#283443]"
              title="Close drawer [ESC]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[#F1F4F6]">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="p-3 bg-[#0C1118] border-t border-[#283443] flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
