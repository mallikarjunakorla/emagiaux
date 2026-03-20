/**
 * WorkflowProgress — Step-by-step progress tracker for the Period-End Close workflow.
 *
 * Supports horizontal and vertical orientations, sign-off actions,
 * dependency blocking, and live completion percentage.
 *
 * Usage:
 *   <WorkflowProgress
 *     steps={closeTasks}
 *     orientation="vertical"
 *     onSignOff={(taskId) => signOff(taskId)}
 *   />
 */

import { CheckCircle2, Clock, AlertCircle, Lock, ChevronRight, User } from "lucide-react";
import type { TaskStatus } from "../../types/domain";

// ── Step definition ────────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  category?: string;
  assignee?: string;
  dueAt?: string;           // ISO 8601
  completedAt?: string;     // ISO 8601
  /** IDs of steps that must be completed before this one can start */
  dependencies?: string[];
  signOffRequired?: boolean;
  signedOffBy?: string;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface WorkflowProgressProps {
  steps: WorkflowStep[];
  orientation?: "horizontal" | "vertical";
  /** Show sign-off button on steps with signOffRequired=true */
  onSignOff?: (stepId: string) => void;
  /** Show "Mark Complete" button on in-progress steps */
  onComplete?: (stepId: string) => void;
  showCategories?: boolean;
  compact?: boolean;
  className?: string;
}

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, {
  icon: typeof CheckCircle2;
  iconColor: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  label: string;
  connectorColor: string;
}> = {
  completed: {
    icon: CheckCircle2,
    iconColor: "text-white",
    iconBg: "bg-[#22c55e]",
    badgeBg: "bg-[#dcfce7]",
    badgeText: "text-[#15803d]",
    label: "Completed",
    connectorColor: "bg-[#22c55e]",
  },
  "in-progress": {
    icon: Clock,
    iconColor: "text-white",
    iconBg: "bg-[#1a56db]",
    badgeBg: "bg-[#dbeafe]",
    badgeText: "text-[#1d4ed8]",
    label: "In Progress",
    connectorColor: "bg-[#e2e8f0]",
  },
  "awaiting-approval": {
    icon: User,
    iconColor: "text-white",
    iconBg: "bg-[#a855f7]",
    badgeBg: "bg-[#f3e8ff]",
    badgeText: "text-[#7c3aed]",
    label: "Awaiting Approval",
    connectorColor: "bg-[#e2e8f0]",
  },
  pending: {
    icon: Clock,
    iconColor: "text-[#94a3b8]",
    iconBg: "bg-[#f1f5f9] border-2 border-[#e2e8f0]",
    badgeBg: "bg-[#f1f5f9]",
    badgeText: "text-[#64748b]",
    label: "Pending",
    connectorColor: "bg-[#e2e8f0]",
  },
  blocked: {
    icon: Lock,
    iconColor: "text-[#ef4444]",
    iconBg: "bg-[#fee2e2] border-2 border-[#fecaca]",
    badgeBg: "bg-[#fee2e2]",
    badgeText: "text-[#b91c1c]",
    label: "Blocked",
    connectorColor: "bg-[#e2e8f0]",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(dueAt?: string, status?: TaskStatus): boolean {
  if (!dueAt || status === "completed") return false;
  return new Date(dueAt) < new Date();
}

// ── Component ──────────────────────────────────────────────────────────────────

export function WorkflowProgress({
  steps,
  orientation = "vertical",
  onSignOff,
  onComplete,
  showCategories = false,
  compact = false,
  className = "",
}: WorkflowProgressProps) {
  const completed = steps.filter((s) => s.status === "completed").length;
  const completionPct = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

  // Group by category if requested
  const categoryGroups = showCategories
    ? Array.from(new Set(steps.map((s) => s.category ?? "General")))
    : ["__all__"];

  if (orientation === "horizontal") {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Progress bar summary */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-[#334155]">
            {completed} / {steps.length} tasks completed
          </span>
          <span className="text-xs font-bold text-[#1a56db]">{completionPct}%</span>
        </div>
        <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22c55e] rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Horizontal step dots */}
        <div className="flex items-center gap-0 mt-4 overflow-x-auto pb-1">
          {steps.map((step, i) => {
            const cfg = STATUS_CONFIG[step.status];
            const Icon = cfg.icon;
            const overdue = isOverdue(step.dueAt, step.status);
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1.5 group">
                  <div
                    title={step.title}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.iconBg} transition-transform group-hover:scale-110`}
                  >
                    <Icon size={14} className={cfg.iconColor} />
                  </div>
                  {!compact && (
                    <div className="text-center max-w-[80px]">
                      <div className="text-[10px] font-medium text-[#334155] leading-tight line-clamp-2">
                        {step.title}
                      </div>
                      {overdue && (
                        <span className="text-[9px] text-[#ef4444] font-semibold">OVERDUE</span>
                      )}
                    </div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${step.status === "completed" ? "bg-[#22c55e]" : "bg-[#e2e8f0]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Vertical layout ──
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Completion summary */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22c55e] rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#334155] flex-shrink-0">
          {completionPct}% complete
        </span>
      </div>

      {categoryGroups.map((cat) => {
        const catSteps =
          cat === "__all__"
            ? steps
            : steps.filter((s) => (s.category ?? "General") === cat);

        return (
          <div key={cat}>
            {showCategories && cat !== "__all__" && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
                  {cat}
                </span>
                <div className="flex-1 h-px bg-[#f1f5f9]" />
              </div>
            )}

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#e2e8f0] z-0" />

              <div className="space-y-3">
                {catSteps.map((step) => {
                  const cfg = STATUS_CONFIG[step.status];
                  const Icon = cfg.icon;
                  const overdue = isOverdue(step.dueAt, step.status);
                  const canSignOff =
                    step.signOffRequired &&
                    !step.signedOffBy &&
                    step.status === "awaiting-approval";
                  const canComplete =
                    step.status === "in-progress";

                  return (
                    <div
                      key={step.id}
                      className={`relative flex items-start gap-3 z-10 ${
                        compact ? "py-1" : "py-2"
                      }`}
                    >
                      {/* Step icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg} shadow-sm`}
                      >
                        <Icon size={14} className={cfg.iconColor} />
                      </div>

                      {/* Step content */}
                      <div className="flex-1 min-w-0 bg-white rounded-lg border border-[#f1f5f9] shadow-sm px-3 py-2.5 hover:border-[#e2e8f0] transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-semibold ${
                                  step.status === "completed"
                                    ? "text-[#64748b] line-through"
                                    : "text-[#0f172a]"
                                }`}
                              >
                                {step.title}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}
                              >
                                {cfg.label}
                              </span>
                              {overdue && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#b91c1c]">
                                  <AlertCircle size={9} /> Overdue
                                </span>
                              )}
                            </div>
                            {!compact && step.description && (
                              <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">
                                {step.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {step.assignee && (
                                <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                                  <User size={10} /> {step.assignee}
                                </span>
                              )}
                              {step.dueAt && (
                                <span
                                  className={`text-[10px] ${overdue ? "text-[#ef4444] font-semibold" : "text-[#94a3b8]"}`}
                                >
                                  Due: {formatDate(step.dueAt)}
                                </span>
                              )}
                              {step.completedAt && (
                                <span className="text-[10px] text-[#22c55e]">
                                  ✓ {formatDate(step.completedAt)}
                                </span>
                              )}
                              {step.signedOffBy && (
                                <span className="text-[10px] text-[#7c3aed]">
                                  Signed: {step.signedOffBy}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {canSignOff && onSignOff && (
                              <button
                                onClick={() => onSignOff(step.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#7c3aed] bg-[#f3e8ff] border border-[#e9d5ff] rounded-lg hover:bg-[#e9d5ff] transition-colors"
                              >
                                Sign Off
                              </button>
                            )}
                            {canComplete && onComplete && (
                              <button
                                onClick={() => onComplete(step.id)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] rounded-lg hover:bg-[#bbf7d0] transition-colors"
                              >
                                Complete <ChevronRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
