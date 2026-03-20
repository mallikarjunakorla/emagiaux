import { useState } from "react";
import { Filter, X, CalendarDays, ChevronDown, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  id: string;
  label: string;
  type: "select" | "date-range" | "text";
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterToolbarProps {
  filters: FilterField[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (id: string, value: string) => void;
  onClearAll?: () => void;
  resultCount?: number;
  actions?: React.ReactNode;
}

export function FilterToolbar({
  filters,
  activeFilters = {},
  onFilterChange,
  onClearAll,
  resultCount,
  actions,
}: FilterToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  const visibleFilters = expanded ? filters : filters.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f5f9]">
        {/* Left: Filter icon + label */}
        <div className="flex items-center gap-2 text-[#334155]">
          <SlidersHorizontal size={15} className="text-[#64748b]" />
          <span className="text-sm font-medium">Filters</span>
          {activeCount > 0 && (
            <span className="bg-[#1a56db] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="text-xs text-[#64748b]">
            <span className="font-semibold text-[#334155]">{resultCount.toLocaleString()}</span> results
          </span>
        )}

        {/* Clear all */}
        {activeCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-[#ef4444] hover:text-[#dc2626] transition-colors px-2 py-1 rounded hover:bg-[#fef2f2]"
          >
            <X size={12} />
            Clear all
          </button>
        )}

        {/* Expand toggle */}
        {filters.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#1a56db] hover:text-[#1d4ed8] transition-colors"
          >
            {expanded ? "Less" : `+${filters.length - 3} more`}
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* Custom actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex flex-wrap items-end gap-3 px-4 py-3">
        {visibleFilters.map((field) => (
          <div key={field.id} className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
              {field.label}
            </label>
            {field.type === "select" && (
              <div className="relative">
                <select
                  value={activeFilters[field.id] || ""}
                  onChange={(e) => onFilterChange?.(field.id, e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">All</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              </div>
            )}
            {field.type === "date-range" && (
              <div className="relative">
                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="date"
                  value={activeFilters[field.id] || ""}
                  onChange={(e) => onFilterChange?.(field.id, e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all w-full"
                />
              </div>
            )}
            {field.type === "text" && (
              <input
                type="text"
                placeholder={field.placeholder || `Filter by ${field.label}...`}
                value={activeFilters[field.id] || ""}
                onChange={(e) => onFilterChange?.(field.id, e.target.value)}
                className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all placeholder:text-[#cbd5e1]"
              />
            )}
          </div>
        ))}

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center ml-2">
            {Object.entries(activeFilters)
              .filter(([, v]) => v)
              .map(([key, val]) => {
                const field = filters.find((f) => f.id === key);
                const opt = field?.options?.find((o) => o.value === val);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs rounded-full"
                  >
                    <span className="text-[#60a5fa]">{field?.label}:</span>
                    {opt?.label || val}
                    <button
                      onClick={() => onFilterChange?.(key, "")}
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
    </div>
  );
}
