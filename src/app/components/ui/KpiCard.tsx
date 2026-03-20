import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconBg?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  sparkline?: number[];
  footer?: string;
}

const variantStyles: Record<NonNullable<KpiCardProps["variant"]>, string> = {
  default: "border-[#e2e8f0]",
  success: "border-[#bbf7d0]",
  warning: "border-[#fde68a]",
  danger: "border-[#fecaca]",
  info: "border-[#bfdbfe]",
};

const variantAccent: Record<NonNullable<KpiCardProps["variant"]>, string> = {
  default: "bg-[#f1f5f9]",
  success: "bg-[#f0fdf4]",
  warning: "bg-[#fffbeb]",
  danger: "bg-[#fef2f2]",
  info: "bg-[#eff6ff]",
};

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  iconBg = "bg-[#dbeafe]",
  variant = "default",
  sparkline,
  footer,
}: KpiCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive
    ? "text-[#15803d]"
    : isNegative
    ? "text-[#b91c1c]"
    : "text-[#64748b]";
  const trendBg = isPositive
    ? "bg-[#dcfce7]"
    : isNegative
    ? "bg-[#fee2e2]"
    : "bg-[#f1f5f9]";

  const maxVal = sparkline ? Math.max(...sparkline) : 1;
  const minVal = sparkline ? Math.min(...sparkline) : 0;
  const range = maxVal - minVal || 1;

  return (
    <div
      className={`bg-white rounded-xl border ${variantStyles[variant]} p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider truncate">
            {title}
          </p>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <div className="text-2xl font-bold text-[#0f172a] leading-tight tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#64748b] mt-0.5">{subtitle}</div>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="flex items-end gap-0.5 h-8">
          {sparkline.map((val, i) => {
            const heightPct = ((val - minVal) / range) * 100;
            const height = Math.max(heightPct, 8);
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all ${
                  i === sparkline.length - 1
                    ? variant === "success" ? "bg-[#22c55e]" :
                      variant === "warning" ? "bg-[#f59e0b]" :
                      variant === "danger" ? "bg-[#ef4444]" :
                      "bg-[#3b82f6]"
                    : variant === "success" ? "bg-[#bbf7d0]" :
                      variant === "warning" ? "bg-[#fde68a]" :
                      variant === "danger" ? "bg-[#fecaca]" :
                      "bg-[#bfdbfe]"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
        {change !== undefined ? (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${trendBg}`}>
            <TrendIcon size={12} className={trendColor} />
            <span className={`text-xs font-semibold ${trendColor}`}>
              {isPositive ? "+" : ""}{change}%
            </span>
            {changeLabel && (
              <span className="text-xs text-[#94a3b8]">{changeLabel}</span>
            )}
          </div>
        ) : (
          <div />
        )}
        {footer && (
          <span className="text-xs text-[#94a3b8]">{footer}</span>
        )}
      </div>
    </div>
  );
}
