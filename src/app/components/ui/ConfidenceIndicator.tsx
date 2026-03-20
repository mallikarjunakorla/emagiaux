/**
 * ConfidenceIndicator — Visualises a 0-100% match confidence score.
 *
 * Usage:
 *   <ConfidenceIndicator score={87} />
 *   <ConfidenceIndicator score={100} size="lg" showLabel />
 *   <ConfidenceIndicator score={null} />   // renders "—"
 */

interface ConfidenceIndicatorProps {
  /** Match confidence score 0-100, or null when no match was attempted. */
  score: number | null;
  /** Visual size: "sm" | "md" (default) | "lg" */
  size?: "sm" | "md" | "lg";
  /** Show the tier label ("Exact", "High", "Good", "Fair", "Low") */
  showLabel?: boolean;
  /** Show the numeric percentage next to the bar */
  showPercent?: boolean;
  /** Render as a pill badge instead of a bar */
  variant?: "bar" | "badge";
}

interface TierConfig {
  bar: string;
  text: string;
  bg: string;
  border: string;
  label: string;
}

function getTierConfig(score: number | null): TierConfig {
  if (score === null)
    return { bar: "bg-[#e2e8f0]", text: "text-[#94a3b8]", bg: "bg-[#f8fafc]", border: "border-[#e2e8f0]", label: "N/A" };
  if (score === 100)
    return { bar: "bg-[#22c55e]", text: "text-[#15803d]", bg: "bg-[#dcfce7]", border: "border-[#bbf7d0]", label: "Exact" };
  if (score >= 90)
    return { bar: "bg-[#3b82f6]", text: "text-[#1d4ed8]", bg: "bg-[#dbeafe]", border: "border-[#bfdbfe]", label: "High" };
  if (score >= 75)
    return { bar: "bg-[#0ea5e9]", text: "text-[#0369a1]", bg: "bg-[#e0f2fe]", border: "border-[#bae6fd]", label: "Good" };
  if (score >= 55)
    return { bar: "bg-[#f59e0b]", text: "text-[#b45309]", bg: "bg-[#fef3c7]", border: "border-[#fde68a]", label: "Fair" };
  return { bar: "bg-[#ef4444]", text: "text-[#b91c1c]", bg: "bg-[#fee2e2]", border: "border-[#fecaca]", label: "Low" };
}

const BAR_HEIGHT: Record<NonNullable<ConfidenceIndicatorProps["size"]>, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

const TEXT_SIZE: Record<NonNullable<ConfidenceIndicatorProps["size"]>, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export function ConfidenceIndicator({
  score,
  size = "md",
  showLabel = false,
  showPercent = true,
  variant = "bar",
}: ConfidenceIndicatorProps) {
  const cfg = getTierConfig(score);
  const pct = score !== null ? score : 0;

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-semibold ${TEXT_SIZE[size]} ${cfg.bg} ${cfg.border} ${cfg.text}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.bar}`}
        />
        {score !== null ? `${score}%` : "—"}
        {showLabel && score !== null && (
          <span className="opacity-70">· {cfg.label}</span>
        )}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {/* Bar track */}
        <div
          className={`flex-1 ${BAR_HEIGHT[size]} bg-[#f1f5f9] rounded-full overflow-hidden min-w-[60px]`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
            style={{ width: score !== null ? `${pct}%` : "0%" }}
          />
        </div>

        {/* Percentage */}
        {showPercent && (
          <span
            className={`tabular-nums font-semibold w-8 text-right flex-shrink-0 ${TEXT_SIZE[size]} ${cfg.text}`}
          >
            {score !== null ? `${score}%` : "—"}
          </span>
        )}
      </div>

      {/* Tier label row */}
      {showLabel && score !== null && (
        <span className={`${TEXT_SIZE[size]} font-semibold ${cfg.text}`}>
          {cfg.label} match
        </span>
      )}
    </div>
  );
}
