/**
 * ReconciliationSummaryPanel — Waterfall calculation panel for the recon close.
 *
 * Shows the full audit trail of how the Opening Balance flows through
 * adjustments to reach the Adjusted Bank Balance, then compares with
 * GL Balance to produce the Final Variance.
 *
 * Usage:
 *   <ReconciliationSummaryPanel
 *     openingBalance={165_200_000}
 *     totalAdditions={10_170.50}
 *     totalSubtractions={3_850}
 *     adjustedBankBalance={166_381_651.25}
 *     glBalance={166_376_390.50}
 *     currency="USD"
 *   />
 */

import {
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  BookOpen,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReconciliationSummaryPanelProps {
  openingBalance: number;
  totalAdditions: number;
  totalSubtractions: number;
  adjustedBankBalance: number;
  glBalance: number;
  currency?: string;
  periodLabel?: string;
  asOfDate?: string;
  certifiedBy?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(v: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function fmtSigned(v: number, currency = "USD"): string {
  const base = fmt(Math.abs(v), currency);
  if (v === 0) return base;
  return v > 0 ? `+${base}` : `−${base}`;
}

// ── Status config ──────────────────────────────────────────────────────────────

interface VarianceStatus {
  label: string;
  sublabel: string;
  icon: typeof CheckCircle2;
  iconColor: string;
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
}

function getVarianceStatus(variance: number): VarianceStatus {
  if (variance === 0) {
    return {
      label: "Fully Reconciled",
      sublabel: "Bank and GL balances are in perfect agreement",
      icon: CheckCircle2,
      iconColor: "text-[#15803d]",
      bg: "bg-[#f0fdf4]",
      border: "border-[#bbf7d0]",
      text: "text-[#15803d]",
      badgeBg: "bg-[#dcfce7]",
      badgeText: "text-[#15803d]",
    };
  }
  const abs = Math.abs(variance);
  if (abs <= 500) {
    return {
      label: "Minor Variance",
      sublabel: "Within acceptable tolerance — review recommended",
      icon: AlertTriangle,
      iconColor: "text-[#b45309]",
      bg: "bg-[#fffbeb]",
      border: "border-[#fde68a]",
      text: "text-[#b45309]",
      badgeBg: "bg-[#fef3c7]",
      badgeText: "text-[#b45309]",
    };
  }
  if (abs <= 50_000) {
    return {
      label: "Variance Detected",
      sublabel: "Requires investigation before period close",
      icon: AlertTriangle,
      iconColor: "text-[#b45309]",
      bg: "bg-[#fffbeb]",
      border: "border-[#fde68a]",
      text: "text-[#b45309]",
      badgeBg: "bg-[#fef3c7]",
      badgeText: "text-[#b45309]",
    };
  }
  return {
    label: "Material Variance",
    sublabel: "Escalation required — cannot proceed to period close",
    icon: XCircle,
    iconColor: "text-[#b91c1c]",
    bg: "bg-[#fef2f2]",
    border: "border-[#fecaca]",
    text: "text-[#b91c1c]",
    badgeBg: "bg-[#fee2e2]",
    badgeText: "text-[#b91c1c]",
  };
}

// ── Waterfall row ──────────────────────────────────────────────────────────────

interface WaterfallRowProps {
  icon: typeof Landmark;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  value: string;
  valueColor?: string;
  operator?: "+" | "−" | "=" | "—";
  isTotal?: boolean;
  isDivider?: boolean;
}

function WaterfallRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  value,
  valueColor = "text-[#0f172a]",
  operator,
  isTotal = false,
  isDivider = false,
}: WaterfallRowProps) {
  if (isDivider) {
    return <div className="h-px bg-[#e2e8f0] my-1" />;
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-colors ${
        isTotal ? "bg-[#f8fafc] border border-[#e2e8f0]" : "hover:bg-[#f8fafc]/70"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Operator column */}
        <div className="w-5 text-center flex-shrink-0">
          {operator && (
            <span
              className={`text-sm font-bold ${
                operator === "+"
                  ? "text-[#15803d]"
                  : operator === "−"
                  ? "text-[#b91c1c]"
                  : operator === "="
                  ? "text-[#1a56db]"
                  : "text-[#94a3b8]"
              }`}
            >
              {operator}
            </span>
          )}
        </div>
        {/* Icon */}
        <div
          className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={15} className={iconColor} />
        </div>
        {/* Label */}
        <div className="min-w-0">
          <span
            className={`text-sm ${isTotal ? "font-bold text-[#0f172a]" : "font-medium text-[#334155]"}`}
          >
            {label}
          </span>
          {sublabel && (
            <p className="text-[10px] text-[#94a3b8] mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
      <span className={`font-mono text-sm tabular-nums flex-shrink-0 ${isTotal ? "text-base" : ""} ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function ReconciliationSummaryPanel({
  openingBalance,
  totalAdditions,
  totalSubtractions,
  adjustedBankBalance,
  glBalance,
  currency = "USD",
  periodLabel = "March 2026",
  asOfDate = "March 13, 2026",
  certifiedBy,
}: ReconciliationSummaryPanelProps) {
  const finalVariance = adjustedBankBalance - glBalance;
  const varStatus = getVarianceStatus(finalVariance);
  const VarIcon = varStatus.icon;

  const varianceValueColor =
    finalVariance === 0
      ? "text-[#15803d]"
      : finalVariance > 0
      ? "text-[#b45309]"
      : "text-[#b91c1c]";

  const TrendIcon =
    finalVariance > 0 ? TrendingUp : finalVariance < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f1f5f9] bg-[#fafbfc]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <Scale size={15} className="text-[#1a56db]" />
          </div>
          <div>
            <h3 className="text-[#0f172a]">Reconciliation Summary</h3>
            <p className="text-xs text-[#64748b]">
              Period: {periodLabel} &nbsp;·&nbsp; As of {asOfDate}
            </p>
          </div>
        </div>
        {/* Overall status pill */}
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${varStatus.badgeBg} ${varStatus.badgeText} ${varStatus.border}`}
        >
          <VarIcon size={12} className={varStatus.iconColor} />
          {varStatus.label}
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Waterfall calculation ── */}
          <div>
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3 px-4">
              Calculation Breakdown
            </p>
            <div className="space-y-0.5">
              <WaterfallRow
                icon={Landmark}
                iconBg="bg-[#dbeafe]"
                iconColor="text-[#1a56db]"
                label="Opening Balance"
                sublabel={`Period start: ${periodLabel}`}
                value={fmt(openingBalance, currency)}
                operator="—"
              />
              <WaterfallRow
                icon={ArrowUpCircle}
                iconBg="bg-[#dcfce7]"
                iconColor="text-[#15803d]"
                label="Total Additions"
                sublabel="Bank charges, interest earned, etc."
                value={`+${fmt(totalAdditions, currency)}`}
                valueColor="text-[#15803d]"
                operator="+"
              />
              <WaterfallRow
                icon={ArrowDownCircle}
                iconBg="bg-[#fee2e2]"
                iconColor="text-[#b91c1c]"
                label="Total Subtractions"
                sublabel="NSF, service fees, deductions, etc."
                value={`−${fmt(totalSubtractions, currency)}`}
                valueColor="text-[#b91c1c]"
                operator="−"
              />
              <WaterfallRow isDivider />
              <WaterfallRow
                icon={Landmark}
                iconBg="bg-[#f3e8ff]"
                iconColor="text-[#7c3aed]"
                label="Adjusted Bank Balance"
                sublabel="Opening ± adjustments"
                value={fmt(adjustedBankBalance, currency)}
                operator="="
                isTotal
              />
              <WaterfallRow
                icon={BookOpen}
                iconBg="bg-[#e0f2fe]"
                iconColor="text-[#0369a1]"
                label="GL Balance"
                sublabel="General ledger as of period"
                value={fmt(glBalance, currency)}
                operator="—"
              />
              <WaterfallRow isDivider />
              <WaterfallRow
                icon={Scale}
                iconBg={finalVariance === 0 ? "bg-[#dcfce7]" : "bg-[#fef3c7]"}
                iconColor={finalVariance === 0 ? "text-[#15803d]" : "text-[#b45309]"}
                label="Final Variance"
                sublabel="Adjusted Bank Balance − GL Balance"
                value={finalVariance === 0 ? fmt(0, currency) : fmtSigned(finalVariance, currency)}
                valueColor={varianceValueColor}
                operator="="
                isTotal
              />
            </div>
          </div>

          {/* ── Right: Status + metrics ── */}
          <div className="flex flex-col gap-4">
            {/* Variance status card */}
            <div
              className={`rounded-xl border p-4 ${varStatus.bg} ${varStatus.border}`}
            >
              <div className="flex items-start gap-3">
                <VarIcon size={22} className={`${varStatus.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className={`font-bold text-base ${varStatus.text}`}>
                    {varStatus.label}
                  </p>
                  <p className={`text-xs mt-1 opacity-80 ${varStatus.text}`}>
                    {varStatus.sublabel}
                  </p>
                  {/* Variance amount */}
                  <div className="mt-3 flex items-center gap-2">
                    <TrendIcon size={14} className={varianceValueColor} />
                    <span
                      className={`font-mono text-xl tabular-nums ${varianceValueColor}`}
                    >
                      {finalVariance === 0
                        ? "$0.00"
                        : fmtSigned(finalVariance, currency)}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      {finalVariance === 0
                        ? "No variance"
                        : finalVariance > 0
                        ? "Bank > GL"
                        : "Bank < GL"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick metric pills */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Opening Balance",
                  value: fmt(openingBalance, currency),
                  icon: Landmark,
                  iconBg: "bg-[#dbeafe]",
                  iconColor: "text-[#1a56db]",
                },
                {
                  label: "Adjusted Bank Bal.",
                  value: fmt(adjustedBankBalance, currency),
                  icon: Landmark,
                  iconBg: "bg-[#f3e8ff]",
                  iconColor: "text-[#7c3aed]",
                },
                {
                  label: "Net Adjustment",
                  value:
                    totalAdditions - totalSubtractions === 0
                      ? "$0.00"
                      : fmtSigned(totalAdditions - totalSubtractions, currency),
                  icon: Scale,
                  iconBg: "bg-[#dcfce7]",
                  iconColor: "text-[#15803d]",
                },
                {
                  label: "GL Balance",
                  value: fmt(glBalance, currency),
                  icon: BookOpen,
                  iconBg: "bg-[#e0f2fe]",
                  iconColor: "text-[#0369a1]",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-[#f8fafc] border border-[#f1f5f9] rounded-lg px-3 py-2.5 flex items-center gap-2"
                >
                  <div
                    className={`w-7 h-7 ${m.iconBg} rounded-md flex items-center justify-center flex-shrink-0`}
                  >
                    <m.icon size={13} className={m.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">
                      {m.label}
                    </div>
                    <div className="text-xs font-mono text-[#334155] truncate">
                      {m.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certification strip */}
            {certifiedBy ? (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg">
                <CheckCircle2 size={14} className="text-[#15803d] flex-shrink-0" />
                <div className="text-xs">
                  <span className="text-[#64748b]">Certified by </span>
                  <span className="font-semibold text-[#0f172a]">{certifiedBy}</span>
                  <span className="text-[#64748b]"> on {asOfDate}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-lg">
                <Clock size={14} className="text-[#b45309] flex-shrink-0" />
                <span className="text-xs text-[#b45309]">
                  Pending CFO / Controller sign-off for {periodLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
