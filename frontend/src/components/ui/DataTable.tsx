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
      <div className="lunar-glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-mono text-slate-400">Querying lunar mission database...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="lunar-glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 mb-3">
          <Database className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-300">No Records Available</h4>
        <p className="text-xs font-mono text-slate-500 mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="lunar-glass rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-space-900/90 text-slate-400 font-mono text-xs uppercase border-b border-slate-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 font-semibold tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {data.map((row, idx) => (
              <tr
                key={row.id ? String(row.id) : idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-cyan-950/20' : 'hover:bg-slate-900/50'
                }`}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={`px-4 py-3 text-slate-300 ${col.className || ''}`}>
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
      <div className="px-4 py-2.5 bg-space-900/40 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>TOTAL RECORDS: {data.length}</span>
        <span>LUNAR ORBITAL REPLICATION: SYNCED</span>
      </div>
    </div>
  );
}
