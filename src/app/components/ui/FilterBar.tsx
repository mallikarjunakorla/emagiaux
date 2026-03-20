/**
 * FilterBar — Flexible, typed filter toolbar for any data table in the system.
 *
 * Replaces inline filter markup across all pages with a single reusable component.
 * Emits a fully-typed `filters` object ready to pass directly to API service calls.
 *
 * Usage:
 *   const [filters, setFilters] = useState<TransactionFilterParams>({});
 *
 *   <FilterBar
 *     fields={TRANSACTION_FILTER_FIELDS}
 *     values={filters}
 *     onChange={setFilters}
 *     resultCount={sortedData.length}
 *   />
 */

import { useState } from "react";
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  CalendarDays,
} from "lucide-react";

// ── Field definition types ─────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export type FilterFieldType = "text" | "search" | "select" | "date" | "number";

export interface FilterField {
  /** Key that maps to the filter params object */
  id: string;
  label: string;
  type: FilterFieldType;
  placeholder?: string;
  options?: SelectOption[];           // for "select" type
  min?: number;                        // for "number" type
  max?: number;
}

// ── Component props ───────────────────────────────────────────────────────────

interface FilterBarProps {
  /** Field definitions — determines which controls to render */
  fields: FilterField[];
  /** Current filter values — keys must match FilterField.id */
  values: Record<string, string | number | undefined>;
  /** Called whenever any filter changes — returns the full updated values object */
  onChange: (values: Record<string, string | number | undefined>) => void;
  /** Total result count to display in the toolbar */
  resultCount?: number;
  /** Render extra action buttons (e.g. Export, Auto-Match) on the right */
  actions?: React.ReactNode;
  /** Collapse the filter row by default */
  defaultCollapsed?: boolean;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FilterBar({
  fields,
  values,
  onChange,
  resultCount,
  actions,
  defaultCollapsed = false,
  className = "",
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  const activeCount = Object.values(values).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const handleChange = (id: string, value: string | number | undefined) => {
    onChange({ ...values, [id]: value });
  };

  const clearAll = () => {
    const cleared: Record<string, undefined> = {};
    fields.forEach((f) => (cleared[f.id] = undefined));
    onChange(cleared);
  };

  const removeFilter = (id: string) => handleChange(id, undefined);

  // Separate search fields to display inline in the header bar
  const searchFields = fields.filter((f) => f.type === "search");
  const otherFields = fields.filter((f) => f.type !== "search");

  return (
    <div
      className={`bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden ${className}`}
    >
      {/* ── Toolbar header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f1f5f9]">
        {/* Left: icon + label + active count badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SlidersHorizontal size={13} className="text-[#64748b]" />
          <span className="text-sm font-semibold text-[#334155]">Filters</span>
          {activeCount > 0 && (
            <span className="bg-[#1a56db] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {activeCount}
            </span>
          )}
        </div>

        {/* Inline search fields */}
        {searchFields.map((f) => (
          <div key={f.id} className="relative flex-1 max-w-xs">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
            />
            <input
              type="text"
              value={String(values[f.id] ?? "")}
              onChange={(e) => handleChange(f.id, e.target.value || undefined)}
              placeholder={f.placeholder ?? `Search ${f.label}…`}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 focus:bg-white text-[#334155] placeholder:text-[#cbd5e1] transition-all"
            />
          </div>
        ))}

        <div className="flex-1" />

        {/* Right: result count + clear + toggle */}
        <div className="flex items-center gap-3">
          {resultCount !== undefined && (
            <span className="text-xs text-[#94a3b8]">
              <span className="font-semibold text-[#334155]">
                {resultCount.toLocaleString()}
              </span>{" "}
              results
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-[#ef4444] hover:text-[#dc2626] px-2 py-1 rounded hover:bg-[#fef2f2] transition-colors"
            >
              <X size={11} /> Clear all
            </button>
          )}
          {otherFields.length > 0 && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1 text-xs text-[#1a56db] hover:text-[#1d4ed8] transition-colors"
            >
              {expanded ? "Hide" : "Show"} filters
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
          {actions && (
            <div className="flex items-center gap-2 border-l border-[#e2e8f0] pl-3 ml-1">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter fields row ── */}
      {expanded && otherFields.length > 0 && (
        <div className="flex flex-wrap items-end gap-4 px-4 py-3">
          {otherFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                {field.label}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={String(values[field.id] ?? "")}
                  onChange={(e) => handleChange(field.id, e.target.value || undefined)}
                  placeholder={field.placeholder ?? `Filter by ${field.label}…`}
                  className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all placeholder:text-[#cbd5e1] min-w-[160px]"
                />
              )}

              {field.type === "select" && (
                <div className="relative">
                  <select
                    value={String(values[field.id] ?? "")}
                    onChange={(e) => handleChange(field.id, e.target.value || undefined)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all cursor-pointer min-w-[140px]"
                  >
                    <option value="">All {field.label}s</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                  />
                </div>
              )}

              {field.type === "date" && (
                <div className="relative">
                  <CalendarDays
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                  />
                  <input
                    type="date"
                    value={String(values[field.id] ?? "")}
                    onChange={(e) => handleChange(field.id, e.target.value || undefined)}
                    className="pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all"
                  />
                </div>
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  value={values[field.id] ?? ""}
                  min={field.min}
                  max={field.max}
                  onChange={(e) =>
                    handleChange(
                      field.id,
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder={field.placeholder}
                  className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all min-w-[100px]"
                />
              )}
            </div>
          ))}

          {/* Active filter chips */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pb-0.5">
              {otherFields
                .filter((f) => values[f.id] !== undefined && values[f.id] !== "")
                .map((field) => {
                  const raw = values[field.id];
                  const displayVal =
                    field.type === "select"
                      ? field.options?.find((o) => o.value === String(raw))?.label ?? String(raw)
                      : String(raw);
                  return (
                    <span
                      key={field.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs rounded-full"
                    >
                      <span className="text-[#60a5fa]">{field.label}:</span>
                      {displayVal}
                      <button
                        onClick={() => removeFilter(field.id)}
                        className="hover:text-[#1e40af] transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pre-built field configs for each page ─────────────────────────────────────

export const TRANSACTION_FILTER_FIELDS: FilterField[] = [
  { id: "search", label: "Search", type: "search", placeholder: "Search ID, description, counterparty…" },
  { id: "status", label: "Status", type: "select", options: [{ label: "Matched", value: "matched" }, { label: "Unmatched", value: "unmatched" }, { label: "Review", value: "review" }] },
  { id: "dateFrom", label: "Date From", type: "date" },
  { id: "dateTo", label: "Date To", type: "date" },
  { id: "currency", label: "Currency", type: "select", options: ["USD","EUR","GBP","CHF","CAD","AUD","SGD","JPY"].map((c) => ({ label: c, value: c })) },
];

export const EXCEPTION_FILTER_FIELDS: FilterField[] = [
  { id: "search", label: "Search", type: "search", placeholder: "Search ID, account, type…" },
  { id: "priority", label: "Priority", type: "select", options: [{ label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }] },
  { id: "status", label: "Status", type: "select", options: [{ label: "Open", value: "open" }, { label: "Under Review", value: "review" }, { label: "Escalated", value: "escalated" }, { label: "Resolved", value: "resolved" }] },
  { id: "dateFrom", label: "Date From", type: "date" },
];

export const ACCOUNT_FILTER_FIELDS: FilterField[] = [
  { id: "search", label: "Search", type: "search", placeholder: "Search account, bank…" },
  { id: "status", label: "Status", type: "select", options: [{ label: "Reconciled", value: "reconciled" }, { label: "Exception", value: "exception" }, { label: "Unmatched", value: "unmatched" }, { label: "Pending", value: "pending" }] },
  { id: "currency", label: "Currency", type: "select", options: ["USD","EUR","GBP","CHF","CAD","AUD","SGD"].map((c) => ({ label: c, value: c })) },
];
