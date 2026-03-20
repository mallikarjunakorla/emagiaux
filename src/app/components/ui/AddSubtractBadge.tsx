/**
 * AddSubtractBadge — Visual indicator for Add / Subtract adjustment types.
 *
 * Usage:
 *   <AddSubtractBadge type="add" />
 *   <AddSubtractBadge type="subtract" size="lg" showIcon />
 */

import { Plus, Minus } from "lucide-react";

interface AddSubtractBadgeProps {
  type: "add" | "subtract";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  /** Render as a compact pill (default) or a bordered chip */
  variant?: "pill" | "chip";
}

const SIZE_MAP = {
  sm: { px: "px-1.5 py-0.5", text: "text-[10px]", icon: 9, dot: "w-1 h-1" },
  md: { px: "px-2.5 py-1",   text: "text-xs",      icon: 11, dot: "w-1.5 h-1.5" },
  lg: { px: "px-3 py-1.5",   text: "text-sm",      icon: 13, dot: "w-2 h-2" },
};

export function AddSubtractBadge({
  type,
  size = "md",
  showIcon = true,
  variant = "pill",
}: AddSubtractBadgeProps) {
  const s = SIZE_MAP[size];
  const isAdd = type === "add";

  const pillStyles = isAdd
    ? "bg-[#dcfce7] text-[#15803d]"
    : "bg-[#fee2e2] text-[#b91c1c]";

  const chipStyles = isAdd
    ? "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]"
    : "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]";

  const Icon = isAdd ? Plus : Minus;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide select-none ${s.px} ${s.text} ${
        variant === "chip" ? chipStyles : pillStyles
      }`}
    >
      {showIcon && (
        <span
          className={`flex items-center justify-center rounded-full flex-shrink-0 ${s.dot} ${
            isAdd ? "bg-[#22c55e]" : "bg-[#ef4444]"
          }`}
        >
          <Icon size={s.icon - 3} className="text-white" strokeWidth={3} />
        </span>
      )}
      {isAdd ? "Add" : "Subtract"}
    </span>
  );
}
