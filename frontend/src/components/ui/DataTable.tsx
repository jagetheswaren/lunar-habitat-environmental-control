import React, { useState, useMemo } from 'react';
import { Database, Loader2, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | number | null;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  pageSize?: number;
  stickyHeader?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'NO MONITORED RECORDS IN ACTIVE SUBSYSTEM',
  onRowClick,
  selectedRowId,
  searchable = false,
  searchPlaceholder = 'FILTER BUFFER ENTRIES...',
  searchFilter,
  pageSize = 50,
  stickyHeader = true,
}: Props<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filter
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    if (searchFilter) {
      return data.filter(row => searchFilter(row, query));
    }

    return data.filter(row => {
      return columns.some(col => {
        if (col.accessorKey) {
          const val = row[col.accessorKey];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFilter, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (sortedData.length <= pageSize) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111820] border border-[#283443] rounded p-12 text-center flex flex-col items-center justify-center font-mono">
        <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin mb-3" />
        <p className="text-xs text-[#98A3B3] tracking-widest uppercase">
          QUERYING LUNAR MISSION DATABASE...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111820] border border-[#283443] rounded overflow-hidden flex flex-col font-mono text-xs">
      {/* Search Bar / Header Strip */}
      {searchable && (
        <div className="p-2.5 bg-[#0C1118] border-b border-[#283443] flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#657184]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-[#161F2A] border border-[#283443] focus:border-[#06B6D4] rounded px-8 py-1 text-xs text-[#F1F4F6] placeholder-[#657184] outline-none tracking-wider uppercase"
            />
          </div>
          <div className="text-[10px] text-[#657184] uppercase tracking-wider">
            {filteredData.length} OF {data.length} MATCHING
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <div className="overflow-x-auto overflow-y-auto max-h-[640px]">
        <table className="w-full text-left border-collapse">
          <thead
            className={`${
              stickyHeader ? 'sticky top-0 z-10' : ''
            } bg-[#0C1118] text-[#98A3B3] text-[10px] uppercase tracking-wider border-b border-[#283443] select-none`}
          >
            <tr>
              {columns.map((col, idx) => {
                const isSorted = sortKey === col.accessorKey;
                const canSort = col.sortable !== false && !!col.accessorKey;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={idx}
                    onClick={() => canSort && handleSort(col.accessorKey)}
                    className={`px-3 py-2.5 font-bold ${alignClass} ${
                      canSort ? 'cursor-pointer hover:text-[#F1F4F6] hover:bg-[#161F2A]' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="text-[#657184]">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3 h-3 text-[#06B6D4]" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-[#06B6D4]" />
                            )
                          ) : (
                            <span className="w-3 h-3 inline-block" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#283443]/60 bg-[#111820]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center">
                  <div className="w-8 h-8 rounded bg-[#161F2A] border border-[#283443] text-[#657184] flex items-center justify-center mx-auto mb-2.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#F1F4F6] uppercase tracking-wider">
                    NO MATCHING RECORDS
                  </h4>
                  <p className="text-[11px] text-[#657184] mt-0.5">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id ? String(row.id) : idx;
                const isSelected = selectedRowId !== undefined && selectedRowId !== null && String(selectedRowId) === String(row.id);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors duration-100 ${
                      isSelected
                        ? 'bg-[#161F2A] border-l-2 border-[#06B6D4]'
                        : onRowClick
                        ? 'cursor-pointer hover:bg-[#161F2A]/80'
                        : 'hover:bg-[#161F2A]/40'
                    }`}
                  >
                    {columns.map((col, cIdx) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';

                      return (
                        <td
                          key={cIdx}
                          className={`px-3 py-2 text-[#F1F4F6] ${alignClass} ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(row)
                            : col.accessorKey
                            ? String(row[col.accessorKey] ?? '—')
                            : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination Strip */}
      <div className="px-3 py-2 bg-[#0C1118] border-t border-[#283443] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#657184]">
        <div className="flex items-center gap-3">
          <span>ENTRIES: <strong className="text-[#98A3B3]">{sortedData.length}</strong></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#10B981]">SUBSYSTEM SYNC: NOMINAL</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded text-[#98A3B3] hover:text-[#F1F4F6] disabled:opacity-30 disabled:hover:text-[#98A3B3]"
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded text-[#98A3B3] hover:text-[#F1F4F6] disabled:opacity-30 disabled:hover:text-[#98A3B3]"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[#98A3B3]">
              PAGE {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded text-[#98A3B3] hover:text-[#F1F4F6] disabled:opacity-30 disabled:hover:text-[#98A3B3]"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded text-[#98A3B3] hover:text-[#F1F4F6] disabled:opacity-30 disabled:hover:text-[#98A3B3]"
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
