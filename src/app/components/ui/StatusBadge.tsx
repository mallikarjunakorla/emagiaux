interface StatusBadgeProps {
  status:
    | "matched"
    | "unmatched"
    | "exception"
    | "pending"
    | "reconciled"
    | "failed"
    | "in-progress"
    | "approved"
    | "rejected"
    | "review"
    | "closed"
    | "open"
    | "debit"
    | "credit";
  size?: "sm" | "md";
  dot?: boolean;
}

const statusConfig: Record<
  StatusBadgeProps["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  matched: {
    label: "Matched",
    bg: "bg-[#dcfce7]",
    text: "text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
  unmatched: {
    label: "Unmatched",
    bg: "bg-[#fee2e2]",
    text: "text-[#b91c1c]",
    dot: "bg-[#ef4444]",
  },
  exception: {
    label: "Exception",
    bg: "bg-[#fef3c7]",
    text: "text-[#b45309]",
    dot: "bg-[#f59e0b]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
  reconciled: {
    label: "Reconciled",
    bg: "bg-[#dbeafe]",
    text: "text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  failed: {
    label: "Failed",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[#e0f2fe]",
    text: "text-[#0369a1]",
    dot: "bg-[#0ea5e9]",
  },
  approved: {
    label: "Approved",
    bg: "bg-[#d1fae5]",
    text: "text-[#065f46]",
    dot: "bg-[#10b981]",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#ffe4e6]",
    text: "text-[#be123c]",
    dot: "bg-[#f43f5e]",
  },
  review: {
    label: "Under Review",
    bg: "bg-[#faf5ff]",
    text: "text-[#7e22ce]",
    dot: "bg-[#a855f7]",
  },
  closed: {
    label: "Closed",
    bg: "bg-[#f8fafc]",
    text: "text-[#475569]",
    dot: "bg-[#64748b]",
  },
  open: {
    label: "Open",
    bg: "bg-[#fffbeb]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  debit: {
    label: "Debit",
    bg: "bg-[#fee2e2]",
    text: "text-[#b91c1c]",
    dot: "bg-[#ef4444]",
  },
  credit: {
    label: "Credit",
    bg: "bg-[#dcfce7]",
    text: "text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
};

export function StatusBadge({ status, size = "md", dot = true }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />}
      {config.label}
    </span>
  );
}
