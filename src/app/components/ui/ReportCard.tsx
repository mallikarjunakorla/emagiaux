/**
 * ReportCard — Reusable card for a report definition in the catalogue grid.
 *
 * Extracted from ReportsAnalytics.tsx so it can also be embedded in
 * the Dashboard quick-actions or Period-End compliance view.
 *
 * Usage:
 *   <ReportCard
 *     report={reportDefinition}
 *     onGenerate={(id, format) => generateReport({ reportDefinitionId: id, format })}
 *     generating={generatingIds.has(report.id)}
 *   />
 */

import { ElementType } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Play,
  FileText,
  FileSpreadsheet,
  Table2,
} from "lucide-react";
import type { ReportDefinition, FileFormat, ReportFrequency } from "../../types/domain";

// ── File type icon ─────────────────────────────────────────────────────────────

export function FileTypeIcon({
  type,
  size = "md",
}: {
  type: FileFormat;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-6 h-7" : "w-8 h-9";
  const labelSize = size === "sm" ? "text-[8px]" : "text-[9px]";
  const iconSize = size === "sm" ? 10 : 13;

  const configs: Record<FileFormat, { bg: string; stripe: string; icon: ElementType; color: string }> = {
    PDF: { bg: "bg-[#fee2e2]", stripe: "bg-[#ef4444]", icon: FileText, color: "text-[#b91c1c]" },
    XLSX: { bg: "bg-[#dcfce7]", stripe: "bg-[#22c55e]", icon: FileSpreadsheet, color: "text-[#15803d]" },
    CSV: { bg: "bg-[#dbeafe]", stripe: "bg-[#3b82f6]", icon: Table2, color: "text-[#1d4ed8]" },
  };

  const cfg = configs[type];
  const Icon = cfg.icon;

  return (
    <div
      className={`${dim} ${cfg.bg} rounded-md flex flex-col overflow-hidden border border-white/60 shadow-sm flex-shrink-0`}
    >
      <div className={`h-1 w-full ${cfg.stripe}`} />
      <div className="flex-1 flex items-center justify-center">
        <Icon size={iconSize} className={cfg.color} />
      </div>
      <div className={`${cfg.stripe} ${labelSize} font-bold text-white text-center py-0.5`}>
        {type === "XLSX" ? "XLS" : type}
      </div>
    </div>
  );
}

// ── Frequency badge ────────────────────────────────────────────────────────────

const FREQ_STYLE: Record<ReportFrequency, { bg: string; text: string; dot: string }> = {
  Daily:       { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#3b82f6]" },
  Weekly:      { bg: "bg-[#e0f2fe]", text: "text-[#0369a1]", dot: "bg-[#0ea5e9]" },
  Monthly:     { bg: "bg-[#f3e8ff]", text: "text-[#7c3aed]", dot: "bg-[#a855f7]" },
  "On-Demand": { bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#94a3b8]" },
};

export function FrequencyBadge({ freq }: { freq: ReportFrequency }) {
  const s = FREQ_STYLE[freq];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {freq}
    </span>
  );
}

// ── Report card props ──────────────────────────────────────────────────────────

interface ReportCardProps {
  /** The report definition object */
  report: ReportDefinition;
  /** Icon component to display (e.g. BarChart3 from lucide-react) */
  icon: ElementType;
  iconBg?: string;
  iconColor?: string;
  /** Top border accent colour class, e.g. "border-t-[#3b82f6]" */
  accentBorder?: string;
  /** True while a generate job is running for this report */
  generating?: boolean;
  /** True for ~3s after a generate job completes */
  justGenerated?: boolean;
  /** Called when the user clicks Generate — passes the report ID and desired format */
  onGenerate?: (reportId: string, format: FileFormat) => void;
  /** Default format to use when clicking Generate (first in formats array if omitted) */
  defaultFormat?: FileFormat;
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ReportCard({
  report,
  icon: Icon,
  iconBg = "bg-[#dbeafe]",
  iconColor = "text-[#1d4ed8]",
  accentBorder = "border-t-[#3b82f6]",
  generating = false,
  justGenerated = false,
  onGenerate,
  defaultFormat,
  className = "",
}: ReportCardProps) {
  const handleGenerate = () => {
    const format = defaultFormat ?? report.formats[0];
    onGenerate?.(report.id, format);
  };

  const lastGenFormatted = report.lastGeneratedAt
    ? new Date(report.lastGeneratedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div
      className={`bg-white rounded-xl border border-[#e2e8f0] border-t-4 ${accentBorder} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${className}`}
    >
      {/* Card body */}
      <div className="px-4 pt-4 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
          >
            <Icon size={18} className={iconColor} />
          </div>
          <FrequencyBadge freq={report.frequency} />
        </div>

        <h3 className="text-sm font-bold text-[#0f172a] leading-snug mb-1">
          {report.name}
        </h3>
        <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
          {report.description}
        </p>

        {/* Format icons + last run */}
        <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {report.formats.map((fmt) => (
              <FileTypeIcon key={fmt} type={fmt} size="sm" />
            ))}
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">
              Last run
            </div>
            <div className="text-[11px] font-medium text-[#64748b] whitespace-nowrap">
              {lastGenFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleGenerate}
          disabled={generating}
          aria-label={`Generate ${report.name}`}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 font-semibold ${
            justGenerated
              ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
              : generating
              ? "bg-[#eff6ff] text-[#1a56db] border border-[#bfdbfe] cursor-wait"
              : "bg-[#1a56db] text-white hover:bg-[#1d4ed8] shadow-sm"
          }`}
        >
          {justGenerated ? (
            <>
              <CheckCircle2 size={14} /> Generated!
            </>
          ) : generating ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" /> Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
