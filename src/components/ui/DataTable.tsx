import React, { useState, useMemo, ReactNode } from 'react';
import { ChevronsUpDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  initialRowsPerPage = 10,
  emptyMessage = 'No records found matching your criteria',
  emptyIcon,
  isLoading = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
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

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
  }, [data, sortKey, sortDirection]);

  const totalRows = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = data.map((item) => String(item[keyField]));
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="bg-white border border-ticketit-border rounded shadow-sm overflow-hidden flex flex-col">
      {/* Responsive scroll container */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ticketit-table-header border-b border-ticketit-border">
              {selectable && (
                <th className="w-10 px-3 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-ticketit-pink focus:ring-ticketit-pink cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`ticketit-th ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-[#DEE4EE] transition-colors' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center'
                          : col.align === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <ChevronsUpDown
                          className={`w-3.5 h-3.5 ${
                            isSorted ? 'text-ticketit-pink font-bold' : 'text-gray-400'
                          }`}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EAEFF5]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {selectable && (
                    <td className="px-3 py-3">
                      <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-ticketit-text-muted"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon || <div className="text-3xl">📋</div>}
                    <div className="font-semibold text-ticketit-navy">{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = String(row[keyField]);
                const isSelected = selectedIds.includes(rowId);
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-[#FFF0F5]'
                        : isEven
                        ? 'ticketit-row-even'
                        : 'ticketit-row-odd'
                    }`}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-ticketit-pink focus:ring-ticketit-pink cursor-pointer"
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`ticketit-td ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(row, idx) : row[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination matching screenshot */}
      <div className="px-4 py-2.5 bg-white border-t border-ticketit-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ticketit-navy">
        <div className="text-ticketit-text-muted">
          {selectable && selectedIds.length > 0 && (
            <span className="font-semibold text-ticketit-pink mr-3">
              {selectedIds.length} row{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          )}
          <span>Total records: <strong className="text-ticketit-navy">{totalRows}</strong></span>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="text-ticketit-text-muted">Row Per Page:</span>
            <div className="relative inline-block">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-ticketit-border rounded px-2.5 py-1 pr-6 text-xs text-ticketit-navy focus:border-ticketit-pink focus:outline-none cursor-pointer font-medium"
              >
                {rowsPerPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">
              {totalRows === 0 ? '0-0 of 0' : `${startIndex + 1}-${endIndex} of ${totalRows}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || totalRows === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none text-ticketit-navy"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalRows === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none text-ticketit-navy"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
