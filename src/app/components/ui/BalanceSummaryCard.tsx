/**
 * BalanceSummaryCard — Enterprise-grade KPI card for balance amounts.
 *
 * Designed specifically for treasury balance fields (Opening Balance,
 * Closing Balance, GL Balance, Net Variance, etc.). Displays values in
 * monospaced font with left-accent coloring and optional delta comparison.
 *
 * Usage:
 *   <BalanceSummaryCard
 *     label="Bank Opening Balance"
 *     value={165_200_000}
 *     currency="USD"
 *     accent="blue"
 *     icon={<Landmark size={18} />}
 *     sublabel="Period start: Mar 1, 2026"
 *   />
 */

import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type BalanceAccent =
  | "blue"
  | "green"
  | "purple"
  | "teal"
  | "orange"
  | "red"
  | "gray";

interface BalanceSummaryCardProps {
  label: string;
  value: number;
  currency?: string;
  /** Accent color theme for left border and icon background */
  accent?: BalanceAccent;
  icon?: ReactNode;
  sublabel?: string;
  /** Optional delta vs a reference value (e.g. vs GL Balance) */
  deltaValue?: number;
  deltaLabel?: string;
  /** Render the value in a special "status" style (for Recon Status card) */
  statusOverride?: {
    label: string;
    variant: "reconciled" | "exception" | "in-progress" | "pending";
  };
  /** Whether this value represents a variance (colour-codes positive/negative) */
  isVariance?: boolean;
  loading?: boolean;
  className?: string;
}

// ── Accent config ──────────────────────────────────────────────────────────────

const ACCENT: Record<
  BalanceAccent,
  { border: string; iconBg: string; iconText: string; valueTint: string; headerBg: string }
> = {
  blue:   { border: "border-l-[#1a56db]", iconBg: "bg-[#dbeafe]", iconText: "text-[#1a56db]", valueTint: "text-[#0f172a]", headerBg: "bg-[#eff6ff]" },
  green:  { border: "border-l-[#22c55e]", iconBg: "bg-[#dcfce7]", iconText: "text-[#15803d]", valueTint: "text-[#0f172a]", headerBg: "bg-[#f0fdf4]" },
  purple: { border: "border-l-[#a855f7]", iconBg: "bg-[#f3e8ff]", iconText: "text-[#7c3aed]", valueTint: "text-[#0f172a]", headerBg: "bg-[#faf5ff]" },
  teal:   { border: "border-l-[#0ea5e9]", iconBg: "bg-[#e0f2fe]", iconText: "text-[#0369a1]", valueTint: "text-[#0f172a]", headerBg: "bg-[#f0f9ff]" },
  orange: { border: "border-l-[#f59e0b]", iconBg: "bg-[#fef3c7]", iconText: "text-[#b45309]", valueTint: "text-[#0f172a]", headerBg: "bg-[#fffbeb]" },
  red:    { border: "border-l-[#ef4444]", iconBg: "bg-[#fee2e2]", iconText: "text-[#b91c1c]", valueTint: "text-[#0f172a]", headerBg: "bg-[#fef2f2]" },
  gray:   { border: "border-l-[#94a3b8]", iconBg: "bg-[#f1f5f9]", iconText: "text-[#64748b]", valueTint: "text-[#0f172a]", headerBg: "bg-[#f8fafc]" },
};

const STATUS_STYLE: Record<
  NonNullable<BalanceSummaryCardProps["statusOverride"]>["variant"],
  { bg: string; text: string; dot: string; ring: string }
> = {
  reconciled:  { bg: "bg-[#dcfce7]", text: "text-[#15803d]", dot: "bg-[#22c55e]", ring: "ring-[#bbf7d0]" },
  exception:   { bg: "bg-[#fee2e2]", text: "text-[#b91c1c]", dot: "bg-[#ef4444]", ring: "ring-[#fecaca]" },
  "in-progress": { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#3b82f6]", ring: "ring-[#bfdbfe]" },
  pending:     { bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#94a3b8]", ring: "ring-[#e2e8f0]" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatBalance(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: Math.abs(value) >= 1_000_000_000 ? "compact" : "standard",
    compactDisplay: "short",
  }).format(value);
}

function formatCompact(value: number, currency = "USD"): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${formatBalance(abs, currency)}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BalanceSummaryCard({
  label,
  value,
  currency = "USD",
  accent = "blue",
  icon,
  sublabel,
  deltaValue,
  deltaLabel,
  statusOverride,
  isVariance = false,
  loading = false,
  className = "",
}: BalanceSummaryCardProps) {
  const cfg = ACCENT[accent];

  // Variance colouring
  const varianceColor =
    isVariance
      ? value === 0
        ? "text-[#15803d]"
        : value > 0
        ? "text-[#b45309]"
        : "text-[#b91c1c]"
      : cfg.valueTint;

  // Delta
  const deltaIsPos = deltaValue !== undefined && deltaValue > 0;
  const deltaIsNeg = deltaValue !== undefined && deltaValue < 0;
  const DeltaIcon = deltaIsPos ? TrendingUp : deltaIsNeg ? TrendingDown : Minus;
  const deltaColor = deltaIsPos
    ? "text-[#15803d]"
    : deltaIsNeg
    ? "text-[#b91c1c]"
    : "text-[#64748b]";
  const deltaBg = deltaIsPos
    ? "bg-[#dcfce7]"
    : deltaIsNeg
    ? "bg-[#fee2e2]"
    : "bg-[#f1f5f9]";

  return (
    <div
      className={`bg-white rounded-xl border border-[#e2e8f0] border-l-4 ${cfg.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header strip */}
      <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center justify-between border-b border-[#f1f5f9]`}>
        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest truncate pr-2">
          {label}
        </span>
        {icon && (
          <div
            className={`w-7 h-7 ${cfg.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconText}`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 flex flex-col justify-between gap-2">
        {loading ? (
          <div className="h-8 bg-[#f1f5f9] rounded animate-pulse w-3/4" />
        ) : statusOverride ? (
          /* Status override mode — show a badge instead of a number */
          <div className="flex items-center gap-2 py-1">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ring-1 ${STATUS_STYLE[statusOverride.variant].bg} ${STATUS_STYLE[statusOverride.variant].text} ${STATUS_STYLE[statusOverride.variant].ring}`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_STYLE[statusOverride.variant].dot} animate-pulse`}
              />
              {statusOverride.label}
            </span>
          </div>
        ) : (
          <div
            className={`font-mono text-xl tabular-nums tracking-tight ${varianceColor}`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {isVariance && value > 0 ? "+" : ""}
            {formatBalance(value, currency)}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {sublabel && (
            <span className="text-[10px] text-[#94a3b8] truncate">{sublabel}</span>
          )}

          {deltaValue !== undefined && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${deltaBg} ${deltaColor}`}
            >
              <DeltaIcon size={9} />
              {formatCompact(deltaValue, currency)}
              {deltaLabel && <span className="opacity-70 ml-0.5">{deltaLabel}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Currency footer strip */}
      <div className="px-4 pb-2">
        <span className="text-[9px] font-bold text-[#cbd5e1] tracking-widest uppercase">
          {currency}
        </span>
      </div>
    </div>
  );
}
