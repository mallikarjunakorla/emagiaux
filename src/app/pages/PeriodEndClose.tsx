import { useState } from "react";
import { ReactElement } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  ChevronRight,
  FileCheck,
  Shield,
  Users,
  Download,
  Eye,
} from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge";

interface CloseTask {
  id: string;
  step: number;
  task: string;
  category: string;
  owner: string;
  dueDate: string;
  status: "reconciled" | "in-progress" | "pending" | "approved" | "rejected";
  dependency?: string;
  notes?: string;
}

const closeTasks: CloseTask[] = [
  { id: "T1", step: 1, task: "Import all bank statements", category: "Data Ingestion", owner: "System Auto", dueDate: "Mar 31, 2026", status: "approved", notes: "JPMorgan, BoA, Citibank, Wells Fargo, HSBC" },
  { id: "T2", step: 2, task: "Run automated transaction matching", category: "Matching", owner: "Matching Engine", dueDate: "Mar 31, 2026", status: "approved", notes: "Batch run completed: 98.4% match rate" },
  { id: "T3", step: 3, task: "Review and clear exception queue", category: "Exceptions", owner: "Sarah Kim", dueDate: "Mar 31, 2026", status: "in-progress", notes: "14 of 28 exceptions resolved" },
  { id: "T4", step: 4, task: "Validate foreign currency positions", category: "FX Revaluation", owner: "Rachel Chen", dueDate: "Mar 31, 2026", status: "in-progress", dependency: "T3" },
  { id: "T5", step: 5, task: "Confirm intercompany eliminations", category: "Intercompany", owner: "Michael Torres", dueDate: "Mar 31, 2026", status: "pending", dependency: "T4" },
  { id: "T6", step: 6, task: "Treasury manager sign-off (L1)", category: "Approval", owner: "James Wilson", dueDate: "Mar 31, 2026", status: "pending", dependency: "T5" },
  { id: "T7", step: 7, task: "CFO final approval (L2)", category: "Approval", owner: "CFO Office", dueDate: "Mar 31, 2026", status: "pending", dependency: "T6" },
  { id: "T8", step: 8, task: "Post to General Ledger", category: "Posting", owner: "Accounting", dueDate: "Mar 31, 2026", status: "pending", dependency: "T7" },
  { id: "T9", step: 9, task: "Generate SOX compliance evidence package", category: "Compliance", owner: "Compliance Team", dueDate: "Apr 5, 2026", status: "pending", dependency: "T8" },
  { id: "T10", step: 10, task: "Archive period records (7-year retention)", category: "Archival", owner: "System Auto", dueDate: "Apr 5, 2026", status: "pending", dependency: "T9" },
];

const complianceChecks = [
  { label: "SOX Section 302 – CEO/CFO Certification", status: "pending", risk: "High" },
  { label: "SOX Section 404 – Internal Controls Assessment", status: "in-progress", risk: "High" },
  { label: "IFRS 9 – Financial Instrument Classification", status: "approved", risk: "Medium" },
  { label: "ASC 310 – Receivables Verification", status: "approved", risk: "Medium" },
  { label: "Basel III – Liquidity Coverage Ratio", status: "in-progress", risk: "High" },
  { label: "FBAR – Foreign Bank Account Reporting", status: "pending", risk: "Medium" },
];

const statusIcon: Record<string, ReactElement> = {
  approved: <CheckCircle2 size={16} className="text-[#15803d]" />,
  "in-progress": <Clock size={16} className="text-[#0369a1]" />,
  pending: <Clock size={16} className="text-[#94a3b8]" />,
  rejected: <AlertTriangle size={16} className="text-[#b91c1c]" />,
  reconciled: <CheckCircle2 size={16} className="text-[#1d4ed8]" />,
};

const riskStyle: Record<string, string> = {
  High: "bg-[#fee2e2] text-[#b91c1c]",
  Medium: "bg-[#fef3c7] text-[#b45309]",
  Low: "bg-[#dcfce7] text-[#15803d]",
};

const completedTasks = closeTasks.filter(t => t.status === "approved").length;
const progressPct = Math.round((completedTasks / closeTasks.length) * 100);

export function PeriodEndClose() {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[#0f172a]">Period-End Close & Compliance</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Fiscal Period: <span className="font-medium text-[#334155]">Q1 2026 – March 31, 2026</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all">
            <Download size={14} />
            Export Checklist
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-all shadow-sm">
            <Lock size={14} />
            Lock Period
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[#0f172a]">Close Progress</h3>
              <p className="text-xs text-[#64748b] mt-0.5">{completedTasks} of {closeTasks.length} tasks completed</p>
            </div>
            <span className={`text-sm font-bold ${progressPct >= 80 ? "text-[#15803d]" : progressPct >= 50 ? "text-[#b45309]" : "text-[#b91c1c]"}`}>
              {progressPct}%
            </span>
          </div>
          <div className="relative w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#1a56db] to-[#22c55e]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Completed", value: completedTasks, color: "text-[#15803d]", bg: "bg-[#dcfce7]" },
              { label: "In Progress", value: closeTasks.filter(t => t.status === "in-progress").length, color: "text-[#0369a1]", bg: "bg-[#e0f2fe]" },
              { label: "Pending", value: closeTasks.filter(t => t.status === "pending").length, color: "text-[#64748b]", bg: "bg-[#f1f5f9]" },
              { label: "Blocked", value: closeTasks.filter(t => t.status === "rejected").length, color: "text-[#b91c1c]", bg: "bg-[#fee2e2]" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#64748b]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5">
          <h3 className="text-[#0f172a] mb-3">Key Deadlines</h3>
          <div className="space-y-3">
            {[
              { date: "Mar 31", label: "Exception clearance", urgent: true },
              { date: "Mar 31", label: "Manager sign-off (L1)", urgent: true },
              { date: "Mar 31", label: "GL period close", urgent: true },
              { date: "Apr 3", label: "CFO approval (L2)", urgent: false },
              { date: "Apr 5", label: "SOX evidence package", urgent: false },
              { date: "Apr 5", label: "Archive completion", urgent: false },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-12 text-center py-1 rounded-lg text-xs font-semibold ${
                  d.urgent ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#f1f5f9] text-[#64748b]"
                }`}>
                  {d.date}
                </div>
                <span className="text-sm text-[#334155]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Close Checklist */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-[#1a56db]" />
            <h3 className="text-[#0f172a]">Period-End Close Checklist</h3>
          </div>
          <span className="text-xs text-[#64748b]">March 2026</span>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {closeTasks.map((task) => (
            <div key={task.id} className="hover:bg-[#fafbfc] transition-colors">
              <div
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                {/* Step number */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  task.status === "approved" ? "bg-[#dcfce7] text-[#15803d]" :
                  task.status === "in-progress" ? "bg-[#dbeafe] text-[#1d4ed8]" :
                  "bg-[#f1f5f9] text-[#94a3b8]"
                }`}>
                  {task.status === "approved" ? "✓" : task.step}
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">{statusIcon[task.status]}</div>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${task.status === "approved" ? "text-[#64748b] line-through" : "text-[#0f172a]"}`}>
                      {task.task}
                    </span>
                    <span className="text-xs bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded hidden sm:inline-block">
                      {task.category}
                    </span>
                    {task.dependency && task.status === "pending" && (
                      <span className="text-xs text-[#94a3b8]">Blocked by Step {closeTasks.find(t => t.id === task.dependency)?.step}</span>
                    )}
                  </div>
                </div>

                {/* Owner */}
                <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-[#dbeafe] flex items-center justify-center">
                    <Users size={10} className="text-[#1d4ed8]" />
                  </div>
                  <span className="text-xs text-[#64748b]">{task.owner}</span>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">
                  <StatusBadge status={task.status} size="sm" />
                </div>

                {/* Due date */}
                <div className="hidden lg:block flex-shrink-0 text-xs text-[#64748b] w-24 text-right">
                  {task.dueDate}
                </div>

                <ChevronRight size={14} className={`text-[#94a3b8] flex-shrink-0 transition-transform ${expandedTask === task.id ? "rotate-90" : ""}`} />
              </div>

              {/* Expanded detail */}
              {expandedTask === task.id && (
                <div className="px-5 pb-4 ml-16 border-t border-[#f8fafc] pt-3">
                  <div className="bg-[#f8fafc] rounded-lg p-3 flex flex-wrap gap-4">
                    {task.notes && (
                      <div>
                        <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">Notes</span>
                        <p className="text-sm text-[#334155] mt-0.5">{task.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-[#334155] hover:border-[#1a56db] hover:text-[#1a56db] transition-all">
                        <Eye size={12} /> View Evidence
                      </button>
                      {task.status !== "approved" && (
                        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#1a56db] text-white rounded-lg hover:bg-[#1d4ed8] transition-all">
                          <CheckCircle2 size={12} /> Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Framework */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#f1f5f9]">
          <Shield size={16} className="text-[#7c3aed]" />
          <h3 className="text-[#0f172a]">Regulatory Compliance Checklist</h3>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {complianceChecks.map((check, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#fafbfc] transition-colors">
              <div className="flex items-center gap-3">
                <FileCheck size={15} className="text-[#64748b] flex-shrink-0" />
                <span className="text-sm text-[#334155]">{check.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskStyle[check.risk]}`}>
                  {check.risk} Risk
                </span>
                <StatusBadge status={check.status as "pending" | "in-progress" | "approved"} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}