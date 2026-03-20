import { useState, ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Loader2 } from "lucide-react";
import { Pagination } from "./Pagination";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectRow?: (id: string | number) => void;
  onSelectAll?: (selected: boolean) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  onRowAction?: (action: string, row: T) => void;
  rowActions?: { label: string; action: string; danger?: boolean }[];
  emptyMessage?: string;
  stickyHeader?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  loading = false,
  selectable = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  pagination,
  onRowAction,
  rowActions,
  emptyMessage = "No records found",
  stickyHeader = true,
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [actionMenuRow, setActionMenuRow] = useState<string | number | null>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    const cmp = String(aVal) < String(bVal) ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const allSelected = data.length > 0 && data.every((row) => selectedRows.has(row[keyField] as string | number));
  const someSelected = data.some((row) => selectedRows.has(row[keyField] as string | number));

  return (
    <div className={`bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className={`${stickyHeader ? "sticky top-0" : ""} z-10`}>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              {selectable && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 rounded border-[#cbd5e1] text-[#1a56db] cursor-pointer accent-[#1a56db]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left ${col.width ? `w-[${col.width}]` : ""}`}
                  style={{ width: col.width }}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""
                    }`}
                  >
                    <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap">
                      {col.header}
                    </span>
                    {col.sortable && (
                      <button
                        onClick={() => handleSort(String(col.key))}
                        className="text-[#94a3b8] hover:text-[#475569] transition-colors"
                      >
                        {sortKey === String(col.key) ? (
                          sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-[#1a56db]" />
                          ) : (
                            <ArrowDown size={13} className="text-[#1a56db]" />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3 text-[#94a3b8]">
                    <Loader2 size={24} className="animate-spin text-[#1a56db]" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="py-16 text-center text-[#94a3b8] text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => {
                const rowId = row[keyField] as string | number;
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc] ${
                      isSelected ? "bg-[#eff6ff]" : ""
                    } ${rowIndex === sortedData.length - 1 ? "border-b-0" : ""}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow?.(rowId)}
                          className="w-4 h-4 rounded border-[#cbd5e1] text-[#1a56db] cursor-pointer accent-[#1a56db]"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const value = row[col.key as string];
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-4 py-3 text-sm text-[#334155] ${
                            col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                          }`}
                        >
                          {col.render ? col.render(value, row, rowIndex) : String(value ?? "")}
                        </td>
                      );
                    })}
                    {rowActions && (
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setActionMenuRow(actionMenuRow === rowId ? null : rowId)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569] transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {actionMenuRow === rowId && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setActionMenuRow(null)} />
                            <div className="absolute right-4 top-full mt-1 bg-white border border-[#e2e8f0] rounded-lg shadow-xl z-30 py-1 min-w-[140px]">
                              {rowActions.map((action) => (
                                <button
                                  key={action.action}
                                  onClick={() => {
                                    onRowAction?.(action.action, row);
                                    setActionMenuRow(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${
                                    action.danger ? "text-[#ef4444] hover:bg-[#fef2f2]" : "text-[#334155]"
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
