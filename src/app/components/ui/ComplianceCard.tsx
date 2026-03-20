/**
 * ComplianceCard — Displays a compliance control's current status and metadata.
 *
 * Designed for the Period-End Close & Compliance page compliance grid.
 * Each card represents one SOX/IFRS/GAAP control with its assessment status,
 * owner, next review date, and a quick evidence link.
 *
 * Usage:
 *   <ComplianceCard item={complianceItem} onViewEvidence={(id) => openEvidence(id)} />
 */

import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  ExternalLink,
  User,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import type { ComplianceItem, Priority, ComplianceFramework } from "../../types/domain";

// ── Config maps ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ComplianceItem["status"],
  { icon: typeof ShieldCheck; iconColor: string; iconBg: string; badgeBg: string; badgeText: string; label: string; borderColor: string }
> = {
  compliant: {
    icon: ShieldCheck,
    iconColor: "text-[#15803d]",
    iconBg: "bg-[#dcfce7]",
    badgeBg: "bg-[#dcfce7]",
    badgeText: "text-[#15803d]",
    label: "Compliant",
    borderColor: "border-[#bbf7d0]",
  },
  "non-compliant": {
    icon: ShieldX,
    iconColor: "text-[#b91c1c]",
    iconBg: "bg-[#fee2e2]",
    badgeBg: "bg-[#fee2e2]",
    badgeText: "text-[#b91c1c]",
    label: "Non-Compliant",
    borderColor: "border-[#fecaca]",
  },
  "in-review": {
    icon: ShieldAlert,
    iconColor: "text-[#b45309]",
    iconBg: "bg-[#fef3c7]",
    badgeBg: "bg-[#fef3c7]",
    badgeText: "text-[#b45309]",
    label: "In Review",
    borderColor: "border-[#fde68a]",
  },
  "not-assessed": {
    icon: Shield,
    iconColor: "text-[#64748b]",
    iconBg: "bg-[#f1f5f9]",
    badgeBg: "bg-[#f1f5f9]",
    badgeText: "text-[#64748b]",
    label: "Not Assessed",
    borderColor: "border-[#e2e8f0]",
  },
};

const RISK_CONFIG: Record<Priority, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-[#fee2e2]", text: "text-[#b91c1c]", label: "Critical" },
  high:     { bg: "bg-[#fef3c7]", text: "text-[#b45309]", label: "High" },
  medium:   { bg: "bg-[#e0f2fe]", text: "text-[#0369a1]", label: "Medium" },
  low:      { bg: "bg-[#f1f5f9]",  text: "text-[#475569]", label: "Low" },
};

const FRAMEWORK_COLOR: Record<ComplianceFramework, string> = {
  SOX:        "bg-[#dbeafe] text-[#1d4ed8]",
  IFRS:       "bg-[#e0f2fe] text-[#0369a1]",
  "US-GAAP":  "bg-[#dcfce7] text-[#15803d]",
  "BASEL-III":"bg-[#f3e8ff] text-[#7c3aed]",
  INTERNAL:   "bg-[#f1f5f9] text-[#475569]",
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface ComplianceCardProps {
  item: ComplianceItem;
  onViewEvidence?: (id: string) => void;
  onReassess?: (id: string) => void;
  compact?: boolean;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isDueSoon(iso: string): boolean {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date();
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ComplianceCard({
  item,
  onViewEvidence,
  onReassess,
  compact = false,
  className = "",
}: ComplianceCardProps) {
  const cfg = STATUS_CONFIG[item.status];
  const Icon = cfg.icon;
  const risk = RISK_CONFIG[item.risk];
  const overdue = isOverdue(item.nextDueAt);
  const dueSoon = !overdue && isDueSoon(item.nextDueAt);

  return (
    <div
      className={`bg-white rounded-xl border ${cfg.borderColor} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Top accent stripe */}
      <div
        className={`h-1 w-full ${
          item.status === "compliant"
            ? "bg-[#22c55e]"
            : item.status === "non-compliant"
            ? "bg-[#ef4444]"
            : item.status === "in-review"
            ? "bg-[#f59e0b]"
            : "bg-[#94a3b8]"
        }`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-9 h-9 ${cfg.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon size={17} className={cfg.iconColor} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${FRAMEWORK_COLOR[item.framework]}`}
                >
                  {item.framework}
                </span>
                <span className="text-[10px] font-mono text-[#94a3b8]">{item.controlId}</span>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-[#0f172a] leading-snug mb-1">{item.title}</h4>

        {!compact && (
          <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#f8fafc] rounded-lg px-2.5 py-2">
            <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Risk</div>
            <span className={`text-xs font-bold ${risk.text}`}>{risk.label}</span>
          </div>
          <div className="bg-[#f8fafc] rounded-lg px-2.5 py-2">
            <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider mb-0.5">Owner</div>
            <div className="flex items-center gap-1">
              <User size={10} className="text-[#94a3b8]" />
              <span className="text-xs text-[#334155] truncate">{item.owner}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-[10px] mb-3 gap-2">
          <div className="flex items-center gap-1 text-[#94a3b8]">
            <CalendarDays size={10} />
            <span>Assessed: {formatDate(item.lastAssessedAt)}</span>
          </div>
          <div
            className={`flex items-center gap-1 font-semibold ${
              overdue
                ? "text-[#b91c1c]"
                : dueSoon
                ? "text-[#b45309]"
                : "text-[#94a3b8]"
            }`}
          >
            {overdue && <AlertTriangle size={9} />}
            Next: {formatDate(item.nextDueAt)}
            {overdue && " · OVERDUE"}
            {dueSoon && !overdue && " · Due soon"}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
          {item.evidenceUrl && onViewEvidence && (
            <button
              onClick={() => onViewEvidence(item.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1a56db] bg-[#eff6ff] border border-[#bfdbfe] rounded-lg hover:bg-[#dbeafe] transition-colors"
            >
              <ExternalLink size={11} /> Evidence
            </button>
          )}
          {onReassess && item.status !== "compliant" && (
            <button
              onClick={() => onReassess(item.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-colors"
            >
              Re-assess
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
