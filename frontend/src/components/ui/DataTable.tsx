import React from 'react';
import { Database, Loader2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found in database',
  onRowClick,
}: Props<T>) {
  if (loading) {
    return (
      <div className="panel-card p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin mb-3" />
        <p className="text-xs font-mono text-[#8C9BAE] tracking-wider uppercase">
          QUERYING LUNAR MISSION DATABASE...
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="panel-card p-10 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded bg-[#161D2B] border border-[#1E2638] text-[#8C9BAE] flex items-center justify-center mb-3">
          <Database className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold font-mono text-[#F0F4F8] uppercase tracking-wide">
          NO RECORDS AVAILABLE
        </h4>
        <p className="text-xs font-mono text-[#8C9BAE] mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="panel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0B0E14] text-[#8C9BAE] text-[10px] uppercase tracking-wider border-b border-[#1E2638]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-3.5 py-2.5 font-bold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2638] bg-[#111622]">
            {data.map((row, idx) => (
              <tr
                key={row.id ? String(row.id) : idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-100 ${
                  onRowClick ? 'cursor-pointer hover:bg-[#161D2B]' : 'hover:bg-[#141A27]'
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-3.5 py-2 text-[#F0F4F8] ${col.className || ''}`}>
                    {col.render
                      ? col.render(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '—')
                      : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3.5 py-2 bg-[#0B0E14] border-t border-[#1E2638] flex items-center justify-between text-[10px] font-mono text-[#5A677B]">
        <span>TOTAL ENTRIES: {data.length}</span>
        <span className="text-[#10B981]">LEDGER / SENSOR SYNC: NOMINAL</span>
      </div>
    </div>
  );
}
