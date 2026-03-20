import { useState, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  X,
  Search,
  Download,
  Plus,
  Users,
  ArrowUpRight,
  Pencil,
  Ban,
  RefreshCw,
  Wrench,
  FileCheck,
  SlidersHorizontal,
  CalendarDays,
  MessageSquare,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  Hash,
  Eye,
  MoreHorizontal,
  ShieldAlert,
  CircleDot,
  Activity,
  Building2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Priority = "critical" | "high" | "medium" | "low";
type ExStatus = "open" | "review" | "escalated" | "resolved";

interface ExceptionItem {
  id: string;
  caseId: string;
  account: string;
  bank: string;
  exceptionType: string;
  amount: number;
  currency: string;
  age: number; // days open
  priority: Priority;
  status: ExStatus;
  assignee: string;
  assigneeInitials: string;
  description: string;
  createdDate: string;
  dueDate: string;
  lastActivity: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const exceptions: ExceptionItem[] = [
  { id: "1", caseId: "EXC-2026-0901", account: "Treasury — USD Reserve", bank: "JPMorgan Chase", exceptionType: "Amount Mismatch", amount: 2_100_000, currency: "USD", age: 4, priority: "critical", status: "open", assignee: "Sarah Kim", assigneeInitials: "SK", description: "Bank statement records $2.1M debit; GL entry shows $2.08M. Delta of $20,000 unaccounted for across settlement leg.", createdDate: "Mar 10, 2026", dueDate: "Mar 14, 2026", lastActivity: "2h ago" },
  { id: "2", caseId: "EXC-2026-0898", account: "Intercompany — USD", bank: "Goldman Sachs", exceptionType: "Missing Transaction", amount: 1_450_000, currency: "USD", age: 6, priority: "critical", status: "escalated", assignee: "Michael Torres", assigneeInitials: "MT", description: "Intercompany wire of $1.45M received on bank statement with no corresponding GL entry. Possible system feed failure.", createdDate: "Mar 8, 2026", dueDate: "Mar 13, 2026", lastActivity: "45m ago" },
  { id: "3", caseId: "EXC-2026-0848", account: "Hedging — EUR", bank: "Deutsche Bank", exceptionType: "FX Rate Variance", amount: 3_200_000, currency: "EUR", age: 3, priority: "critical", status: "review", assignee: "Rachel Chen", assigneeInitials: "RC", description: "EUR/USD conversion applied at 1.0842 vs agreed 1.0891. Total exposure variance of €3.2M requires restatement.", createdDate: "Mar 11, 2026", dueDate: "Mar 15, 2026", lastActivity: "1h ago" },
  { id: "4", caseId: "EXC-2026-0890", account: "Operating — USD Primary", bank: "Bank of America", exceptionType: "Amount Mismatch", amount: 348_200, currency: "USD", age: 3, priority: "high", status: "open", assignee: "James Wilson", assigneeInitials: "JW", description: "ACH debit of $348,200.50 in bank statement vs $348,205.00 in GL. Likely rounding discrepancy from payment processor.", createdDate: "Mar 11, 2026", dueDate: "Mar 16, 2026", lastActivity: "3h ago" },
  { id: "5", caseId: "EXC-2026-0884", account: "Disbursements — GBP", bank: "HSBC", exceptionType: "FX Rate Variance", amount: 220_000, currency: "GBP", age: 5, priority: "high", status: "review", assignee: "Priya Patel", assigneeInitials: "PP", description: "GBP vendor payment processed at incorrect FX rate. Bank confirms £220,000 debit; GL records £218,500 equivalent.", createdDate: "Mar 9, 2026", dueDate: "Mar 14, 2026", lastActivity: "5h ago" },
  { id: "6", caseId: "EXC-2026-0881", account: "Capex — USD", bank: "Citibank", exceptionType: "Missing Reference", amount: 445_000, currency: "USD", age: 7, priority: "high", status: "escalated", assignee: "David Park", assigneeInitials: "DP", description: "Payment of $445K to Dell Technologies has no matching PO reference. AP team unable to locate authorisation trail.", createdDate: "Mar 7, 2026", dueDate: "Mar 12, 2026", lastActivity: "Yesterday" },
  { id: "7", caseId: "EXC-2026-0851", account: "Payroll — USD", bank: "Wells Fargo", exceptionType: "Missing Transaction", amount: 780_000, currency: "USD", age: 1, priority: "high", status: "open", assignee: "Sarah Kim", assigneeInitials: "SK", description: "March payroll batch of $780K posted to bank on Mar 13 but GL feed not yet received. Payroll system ticket raised.", createdDate: "Mar 13, 2026", dueDate: "Mar 17, 2026", lastActivity: "30m ago" },
  { id: "8", caseId: "EXC-2026-0887", account: "Revenue — CAD", bank: "TD Bank", exceptionType: "Duplicate Entry", amount: 512_900, currency: "CAD", age: 2, priority: "high", status: "review", assignee: "Rachel Chen", assigneeInitials: "RC", description: "Duplicate wire entry detected: reference TXN-2026-084411 appears twice in Mar 12 GL batch. Bank confirms single debit.", createdDate: "Mar 12, 2026", dueDate: "Mar 17, 2026", lastActivity: "4h ago" },
  { id: "9", caseId: "EXC-2026-0878", account: "Operating — USD Primary", bank: "JPMorgan Chase", exceptionType: "Date Discrepancy", amount: 89_450, currency: "USD", age: 3, priority: "medium", status: "review", assignee: "Michael Torres", assigneeInitials: "MT", description: "Bank posting date Mar 10 vs GL value date Mar 7. 3-business-day discrepancy exceeds 2-day tolerance policy.", createdDate: "Mar 11, 2026", dueDate: "Mar 18, 2026", lastActivity: "6h ago" },
  { id: "10", caseId: "EXC-2026-0875", account: "Collections — EUR", bank: "Citibank", exceptionType: "Currency Variance", amount: 67_320, currency: "EUR", age: 2, priority: "medium", status: "open", assignee: "James Wilson", assigneeInitials: "JW", description: "FX conversion rate mismatch of 0.43% on €67,320 collection. Equivalent to $290 variance at current rates.", createdDate: "Mar 12, 2026", dueDate: "Mar 19, 2026", lastActivity: "Yesterday" },
  { id: "11", caseId: "EXC-2026-0872", account: "Operating — USD Primary", bank: "Bank of America", exceptionType: "Bank Fee Dispute", amount: 18_750, currency: "USD", age: 4, priority: "medium", status: "review", assignee: "Priya Patel", assigneeInitials: "PP", description: "Unexpected wire fee of $18,750 charged on Mar 10. Relationship manager contacted; bank to issue credit note.", createdDate: "Mar 10, 2026", dueDate: "Mar 17, 2026", lastActivity: "2 days ago" },
  { id: "12", caseId: "EXC-2026-0869", account: "Tax Escrow — USD", bank: "JPMorgan Chase", exceptionType: "Timing Difference", amount: 34_100, currency: "USD", age: 1, priority: "medium", status: "open", assignee: "David Park", assigneeInitials: "DP", description: "Q1 tax escrow funding of $34,100 shows in bank Mar 13 but GL scheduled for Mar 14. Cut-off timing difference.", createdDate: "Mar 13, 2026", dueDate: "Mar 20, 2026", lastActivity: "1h ago" },
  { id: "13", caseId: "EXC-2026-0866", account: "Vendor Payments — CHF", bank: "UBS", exceptionType: "Amount Mismatch", amount: 150_000, currency: "CHF", age: 8, priority: "medium", status: "resolved", assignee: "Sarah Kim", assigneeInitials: "SK", description: "CHF vendor overpayment of 14,500. Bank confirmed correction issued. GL adjusted via journal entry JNL-2026-0441.", createdDate: "Mar 6, 2026", dueDate: "Mar 13, 2026", lastActivity: "Mar 13" },
  { id: "14", caseId: "EXC-2026-0845", account: "Capex — USD", bank: "Citibank", exceptionType: "Duplicate Entry", amount: 92_400, currency: "USD", age: 6, priority: "medium", status: "escalated", assignee: "Rachel Chen", assigneeInitials: "RC", description: "Duplicate hardware invoice payment to Equinix. AP confirmed double processing. Refund request submitted to vendor.", createdDate: "Mar 8, 2026", dueDate: "Mar 14, 2026", lastActivity: "Mar 12" },
  { id: "15", caseId: "EXC-2026-0863", account: "Operating — USD Primary", bank: "Wells Fargo", exceptionType: "Missing Reference", amount: 18_750, currency: "USD", age: 7, priority: "low", status: "open", assignee: "Michael Torres", assigneeInitials: "MT", description: "No matching reference number for $18,750 credit in GL. Likely miscoded inbound payment from minor counterparty.", createdDate: "Mar 7, 2026", dueDate: "Mar 21, 2026", lastActivity: "3 days ago" },
  { id: "16", caseId: "EXC-2026-0860", account: "Petty Cash — USD", bank: "Bank of America", exceptionType: "GL Code Error", amount: 4_200, currency: "USD", age: 2, priority: "low", status: "review", assignee: "James Wilson", assigneeInitials: "JW", description: "Petty cash reimbursement of $4,200 posted to wrong cost centre (CC-4421 vs CC-4412). Reclassification pending approval.", createdDate: "Mar 12, 2026", dueDate: "Mar 20, 2026", lastActivity: "Today" },
  { id: "17", caseId: "EXC-2026-0857", account: "Customer Refunds — USD", bank: "Wells Fargo", exceptionType: "Timing Difference", amount: 8_900, currency: "USD", age: 5, priority: "low", status: "resolved", assignee: "Priya Patel", assigneeInitials: "PP", description: "Customer refund cleared in bank 2 days after GL posting. Timing difference resolved upon bank confirmation.", createdDate: "Mar 9, 2026", dueDate: "Mar 14, 2026", lastActivity: "Mar 12" },
  { id: "18", caseId: "EXC-2026-0854", account: "Operating — SGD", bank: "DBS Bank", exceptionType: "Date Discrepancy", amount: 2_100, currency: "SGD", age: 9, priority: "low", status: "resolved", assignee: "David Park", assigneeInitials: "DP", description: "SGD clearing date variance of 1 day. Auto-resolved by reconciliation engine after bank confirmed value date.", createdDate: "Mar 5, 2026", dueDate: "Mar 12, 2026", lastActivity: "Mar 11" },
  { id: "19", caseId: "EXC-2026-0842", account: "Operating — USD Primary", bank: "JPMorgan Chase", exceptionType: "Missing Reference", amount: 12_300, currency: "USD", age: 10, priority: "low", status: "resolved", assignee: "Sarah Kim", assigneeInitials: "SK", description: "Reference mismatch resolved: counterparty provided remittance advice confirming invoice #INV-7821.", createdDate: "Mar 4, 2026", dueDate: "Mar 11, 2026", lastActivity: "Mar 10" },
  { id: "20", caseId: "EXC-2026-0895", account: "Investments — USD", bank: "Morgan Stanley", exceptionType: "GL Code Error", amount: 880_000, currency: "USD", age: 2, priority: "critical", status: "review", assignee: "James Wilson", assigneeInitials: "JW", description: "Bond coupon of $880K posted to trading account GL-5520 instead of investment income GL-6110. Restatement required.", createdDate: "Mar 12, 2026", dueDate: "Mar 16, 2026", lastActivity: "3h ago" },
];

// ── Config ─────────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, {
  label: string; bg: string; text: string; border: string;
  dot: string; rowBg: string; rowBorder: string; cardBg: string;
  cardBorder: string; cardAccent: string; icon: typeof AlertCircle;
}> = {
  critical: {
    label: "Critical", bg: "bg-[#fee2e2]", text: "text-[#b91c1c]",
    border: "border-[#fecaca]", dot: "bg-[#ef4444]",
    rowBg: "bg-[#fff5f5]", rowBorder: "border-l-[#ef4444]",
    cardBg: "bg-gradient-to-br from-[#fff1f1] to-[#fee2e2]",
    cardBorder: "border-[#fecaca]", cardAccent: "bg-[#ef4444]",
    icon: ShieldAlert,
  },
  high: {
    label: "High", bg: "bg-[#fef3c7]", text: "text-[#b45309]",
    border: "border-[#fde68a]", dot: "bg-[#f59e0b]",
    rowBg: "bg-[#fffdf0]", rowBorder: "border-l-[#f59e0b]",
    cardBg: "bg-gradient-to-br from-[#fffbeb] to-[#fef3c7]",
    cardBorder: "border-[#fde68a]", cardAccent: "bg-[#f59e0b]",
    icon: AlertTriangle,
  },
  medium: {
    label: "Medium", bg: "bg-[#e0f2fe]", text: "text-[#0369a1]",
    border: "border-[#bae6fd]", dot: "bg-[#0ea5e9]",
    rowBg: "bg-white", rowBorder: "border-l-[#0ea5e9]",
    cardBg: "bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe]",
    cardBorder: "border-[#bae6fd]", cardAccent: "bg-[#0ea5e9]",
    icon: AlertCircle,
  },
  low: {
    label: "Low", bg: "bg-[#f1f5f9]", text: "text-[#475569]",
    border: "border-[#e2e8f0]", dot: "bg-[#94a3b8]",
    rowBg: "bg-white", rowBorder: "border-l-[#94a3b8]",
    cardBg: "bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]",
    cardBorder: "border-[#e2e8f0]", cardAccent: "bg-[#94a3b8]",
    icon: CircleDot,
  },
};

const STATUS_CONFIG: Record<ExStatus, { label: string; bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  open: { label: "Open", bg: "bg-[#fff7ed]", text: "text-[#c2410c]", dot: "bg-[#fb923c]", icon: AlertCircle },
  review: { label: "Under Review", bg: "bg-[#faf5ff]", text: "text-[#7e22ce]", dot: "bg-[#a855f7]", icon: Eye },
  escalated: { label: "Escalated", bg: "bg-[#fee2e2]", text: "text-[#b91c1c]", dot: "bg-[#ef4444]", icon: ArrowUpRight },
  resolved: { label: "Resolved", bg: "bg-[#dcfce7]", text: "text-[#15803d]", dot: "bg-[#22c55e]", icon: CheckCircle2 },
};

const RESOLUTION_ACTIONS = [
  {
    id: "writeoff",
    label: "Write-Off",
    desc: "Approve write-off up to policy threshold. Requires dual approval for amounts ≥$10K.",
    icon: Ban,
    color: "text-[#b91c1c]",
    bg: "bg-[#fee2e2]",
    border: "border-[#fecaca]",
    hover: "hover:bg-[#fecaca]",
  },
  {
    id: "reclassify",
    label: "Reclassify",
    desc: "Move to correct GL account or cost centre. Generates journal entry for audit trail.",
    icon: Pencil,
    color: "text-[#7e22ce]",
    bg: "bg-[#faf5ff]",
    border: "border-[#e9d5ff]",
    hover: "hover:bg-[#e9d5ff]",
  },
  {
    id: "await-bank",
    label: "Await Bank Confirmation",
    desc: "Hold pending bank's written confirmation. Sets 5-business-day SLA timer.",
    icon: Clock,
    color: "text-[#0369a1]",
    bg: "bg-[#e0f2fe]",
    border: "border-[#bae6fd]",
    hover: "hover:bg-[#bae6fd]",
  },
  {
    id: "manual-adj",
    label: "Manual Adjustment",
    desc: "Post correcting journal entry. Requires supporting documentation and manager sign-off.",
    icon: Wrench,
    color: "text-[#b45309]",
    bg: "bg-[#fef3c7]",
    border: "border-[#fde68a]",
    hover: "hover:bg-[#fde68a]",
  },
  {
    id: "escalate",
    label: "Escalate",
    desc: "Escalate to senior controller or CFO for exceptions above materiality threshold.",
    icon: ArrowUpRight,
    color: "text-[#b91c1c]",
    bg: "bg-[#fff1f1]",
    border: "border-[#fecaca]",
    hover: "hover:bg-[#fee2e2]",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyFull(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

// ── Main Component ─────────────────────────────────────────────────────────────

type SortKey = keyof ExceptionItem | null;
type TabId = "all" | "open" | "review" | "escalated" | "resolved";

export function ExceptionManagement() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [priorityFilter, setPriorityFilter] = useState<"" | Priority>("");
  const [statusFilter, setStatusFilter] = useState<"" | ExStatus>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeException, setActiveException] = useState<ExceptionItem | null>(exceptions[0]);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionMenuRow, setActionMenuRow] = useState<string | null>(null);
  const [resolvedAction, setResolvedAction] = useState<string | null>(null);

  // ── KPI derivations ──
  const kpiData = useMemo(() => {
    const priorities: Priority[] = ["critical", "high", "medium", "low"];
    return priorities.map((p) => {
      const items = exceptions.filter((e) => e.priority === p && e.status !== "resolved");
      const total = items.reduce((s, e) => s + e.amount, 0);
      return { priority: p, count: items.length, total, currency: "USD" };
    });
  }, []);

  // ── Filter + sort ──
  const filteredData = useMemo(() => {
    return exceptions.filter((e) => {
      if (activeTab !== "all" && e.status !== activeTab) return false;
      if (priorityFilter && e.priority !== priorityFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!e.caseId.toLowerCase().includes(q) &&
          !e.account.toLowerCase().includes(q) &&
          !e.exceptionType.toLowerCase().includes(q) &&
          !e.bank.toLowerCase().includes(q) &&
          !e.assignee.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, priorityFilter, statusFilter, searchQuery]);

  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal: unknown = a[sortKey];
      let bVal: unknown = b[sortKey];
      if (sortKey === "priority") { aVal = priorityOrder[a.priority]; bVal = priorityOrder[b.priority]; }
      if (aVal === bVal) return 0;
      const cmp = (aVal as number | string) < (bVal as number | string) ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return sortedData.slice(s, s + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: string }) => {
    if (sortKey !== k) return <ArrowUpDown size={11} className="text-[#cbd5e1]" />;
    return sortDir === "asc" ? <ArrowUp size={11} className="text-[#1a56db]" /> : <ArrowDown size={11} className="text-[#1a56db]" />;
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const allPageSelected = pagedData.length > 0 && pagedData.every((r) => selectedRows.has(r.id));
  const somePageSelected = pagedData.some((r) => selectedRows.has(r.id));

  const getPageNums = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "review", label: "Under Review" },
    { id: "escalated", label: "Escalated" },
    { id: "resolved", label: "Resolved" },
  ];

  const openCount = exceptions.filter((e) => e.status === "open").length;
  const criticalOpen = exceptions.filter((e) => e.priority === "critical" && e.status !== "resolved").length;

  return (
    <div className="p-6 space-y-5 min-h-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[#0f172a]">Exception Management</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Track, investigate and resolve reconciliation exceptions &nbsp;·&nbsp;
            <span className="font-semibold text-[#b91c1c]">{criticalOpen} critical</span>
            &nbsp;require immediate attention
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Users size={14} /> Bulk Assign
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm">
            <Plus size={14} /> New Exception
          </button>
        </div>
      </div>

      {/* ── Critical Alert Banner ── */}
      {criticalOpen > 0 && (
        <div className="flex items-center gap-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
          <div className="w-8 h-8 bg-[#ef4444] rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-[#991b1b]">
              {criticalOpen} Critical exceptions open —
            </span>
            <span className="text-sm text-[#b91c1c] ml-1">
              {exceptions.filter((e) => e.priority === "critical" && e.status !== "resolved").map((e) => e.caseId).join(", ")}
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#b91c1c] hover:underline flex-shrink-0">
            Review All <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ── Priority KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpiData.map(({ priority, count, total }) => {
          const cfg = PRIORITY_CONFIG[priority];
          const Icon = cfg.icon;
          const isActive = priorityFilter === priority;
          return (
            <button
              key={priority}
              onClick={() => { setPriorityFilter(isActive ? "" : priority); setCurrentPage(1); }}
              className={`${cfg.cardBg} border ${cfg.cardBorder} rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden ${isActive ? "ring-2 ring-[#1a56db] ring-offset-1" : ""}`}
            >
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 h-full w-1 ${cfg.cardAccent} rounded-l-xl`} />
              <div className="pl-2">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 ${cfg.bg} border ${cfg.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={17} className={cfg.text} strokeWidth={2} />
                  </div>
                  <span className={`text-3xl font-bold tracking-tight ${cfg.text}`}>{count}</span>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs font-bold uppercase tracking-widest ${cfg.text} opacity-80`}>{cfg.label}</p>
                  <p className="text-xs text-[#64748b]">
                    Open exceptions
                  </p>
                  <div className="pt-1 border-t border-current border-opacity-10">
                    <p className="text-xs font-semibold text-[#334155]">
                      {formatCurrency(total)} total exposure
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left: Table Section ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tabs + Search row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-0.5 bg-white border border-[#e2e8f0] rounded-xl p-1 shadow-sm overflow-x-auto">
              {tabs.map((tab) => {
                const count = tab.id === "all"
                  ? exceptions.length
                  : exceptions.filter((e) => e.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-[#1a56db] text-white shadow-sm" : "text-[#64748b] hover:text-[#334155] hover:bg-[#f8fafc]"}`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? "bg-[#1d4ed8] text-[#93c5fd]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search ID, account, type…"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 placeholder:text-[#cbd5e1] text-[#334155] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Filter toolbar */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#f1f5f9]">
              <SlidersHorizontal size={13} className="text-[#64748b]" />
              <span className="text-sm font-medium text-[#334155]">Filters</span>
              <div className="ml-auto flex items-center gap-3">
                {(priorityFilter || statusFilter) && (
                  <button
                    onClick={() => { setPriorityFilter(""); setStatusFilter(""); }}
                    className="flex items-center gap-1 text-xs text-[#ef4444] hover:text-[#dc2626] px-2 py-1 rounded hover:bg-[#fef2f2] transition-colors"
                  >
                    <X size={11} /> Clear
                  </button>
                )}
                <span className="text-xs text-[#94a3b8]">
                  <span className="font-semibold text-[#334155]">{filteredData.length}</span> results
                </span>
                <button
                  onClick={() => setFiltersOpen((p) => !p)}
                  className="flex items-center gap-1 text-xs text-[#1a56db] transition-colors"
                >
                  <ChevronDown size={12} className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
            {filtersOpen && (
              <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Priority</label>
                  <div className="relative">
                    <select
                      value={priorityFilter}
                      onChange={(e) => { setPriorityFilter(e.target.value as "" | Priority); setCurrentPage(1); }}
                      className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all cursor-pointer min-w-[130px]"
                    >
                      <option value="">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Status</label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value as "" | ExStatus); setCurrentPage(1); }}
                      className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all cursor-pointer min-w-[140px]"
                    >
                      <option value="">All Statuses</option>
                      <option value="open">Open</option>
                      <option value="review">Under Review</option>
                      <option value="escalated">Escalated</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Date From</label>
                  <div className="relative">
                    <CalendarDays size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                    <input type="date" className="pl-8 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all" />
                  </div>
                </div>
                {selectedRows.size > 0 && (
                  <div className="flex items-end gap-2 ml-auto pb-0.5">
                    <span className="text-xs text-[#64748b]">{selectedRows.size} selected</span>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] rounded-lg hover:bg-[#bbf7d0] transition-colors">
                      <CheckCircle2 size={12} /> Resolve
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#b91c1c] bg-[#fee2e2] border border-[#fecaca] rounded-lg hover:bg-[#fecaca] transition-colors">
                      <ArrowUpRight size={12} /> Escalate
                    </button>
                    <button onClick={() => setSelectedRows(new Set())} className="p-2 text-[#94a3b8] hover:text-[#64748b] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[750px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="w-4 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedRows(new Set(pagedData.map((r) => r.id)));
                          else setSelectedRows(new Set());
                        }}
                        className="w-4 h-4 rounded border-[#cbd5e1] accent-[#1a56db] cursor-pointer"
                      />
                    </th>
                    <th className="w-6 px-1 py-3"><Hash size={11} className="text-[#cbd5e1]" /></th>
                    {[
                      { k: "caseId", label: "Exception ID", w: "150px" },
                      { k: "account", label: "Account", w: "170px" },
                      { k: "exceptionType", label: "Type", w: "145px" },
                      { k: "amount", label: "Amount", w: "115px", right: true },
                      { k: "age", label: "Age", w: "70px", center: true },
                      { k: "priority", label: "Priority", w: "100px" },
                      { k: "status", label: "Status", w: "125px" },
                    ].map((col) => (
                      <th key={col.k} style={{ width: col.w }} className={`px-3 py-3 ${col.right ? "text-right" : col.center ? "text-center" : "text-left"}`}>
                        <button
                          onClick={() => handleSort(col.k as SortKey)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b] hover:text-[#334155] transition-colors ${col.right ? "flex-row-reverse" : ""}`}
                        >
                          {col.label} <SortIcon k={col.k} />
                        </button>
                      </th>
                    ))}
                    <th className="w-16 px-3 py-3 text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.length === 0 ? (
                    <tr><td colSpan={10} className="py-16 text-center text-[#94a3b8] text-sm">No exceptions match your filters.</td></tr>
                  ) : pagedData.map((row, i) => {
                    const pcfg = PRIORITY_CONFIG[row.priority];
                    const scfg = STATUS_CONFIG[row.status];
                    const StatusIcon = scfg.icon;
                    const isSelected = selectedRows.has(row.id);
                    const isActive = activeException?.id === row.id;
                    const isCritical = row.priority === "critical";
                    const rowBg = isSelected ? "bg-[#eff6ff]" : isActive ? "bg-[#f0f7ff]" : isCritical && row.status !== "resolved" ? "bg-[#fff5f5]" : "hover:bg-[#f8fafc]";

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setActiveException(row)}
                        className={`border-b border-[#f1f5f9] transition-colors duration-100 cursor-pointer ${rowBg} ${i === pagedData.length - 1 ? "border-b-0" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id)}
                            className="w-4 h-4 rounded border-[#cbd5e1] accent-[#1a56db] cursor-pointer"
                          />
                        </td>
                        {/* Row # + priority stripe */}
                        <td className="px-1 py-2.5">
                          <div className={`w-1.5 h-5 rounded-full ${pcfg.cardAccent}`} />
                        </td>
                        {/* Case ID */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-semibold text-[#1a56db] hover:underline whitespace-nowrap">{row.caseId}</span>
                            <span className="text-[10px] text-[#94a3b8]">{row.bank}</span>
                          </div>
                        </td>
                        {/* Account */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={11} className="text-[#94a3b8] flex-shrink-0" />
                            <span className="text-xs text-[#334155] line-clamp-1" title={row.account}>{row.account}</span>
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-[#475569] whitespace-nowrap">{row.exceptionType}</span>
                        </td>
                        {/* Amount */}
                        <td className="px-3 py-2.5 text-right">
                          <span className="font-mono text-sm font-semibold text-[#0f172a] whitespace-nowrap">
                            {formatCurrencyFull(row.amount, row.currency)}
                          </span>
                        </td>
                        {/* Age */}
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={11} className={row.age >= 5 ? "text-[#ef4444]" : row.age >= 3 ? "text-[#f59e0b]" : "text-[#94a3b8]"} />
                            <span className={`text-xs font-semibold tabular-nums ${row.age >= 5 ? "text-[#b91c1c]" : row.age >= 3 ? "text-[#b45309]" : "text-[#64748b]"}`}>
                              {row.age}d
                            </span>
                          </div>
                        </td>
                        {/* Priority */}
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${pcfg.bg} ${pcfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pcfg.dot}`} />
                            {pcfg.label}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${scfg.bg} ${scfg.text}`}>
                            <StatusIcon size={10} strokeWidth={2.5} />
                            {scfg.label}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setActiveException(row)}
                              title="Open in workflow panel"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1a56db] transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuRow(actionMenuRow === row.id ? null : row.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569] transition-colors"
                              >
                                <MoreHorizontal size={13} />
                              </button>
                              {actionMenuRow === row.id && (
                                <>
                                  <div className="fixed inset-0 z-20" onClick={() => setActionMenuRow(null)} />
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 py-1 min-w-[170px]">
                                    {[{ label: "View Details", icon: Eye }, { label: "Write-Off", icon: Ban }, { label: "Reclassify", icon: Pencil }, { label: "Escalate", icon: ArrowUpRight, danger: true }, { label: "Mark Resolved", icon: CheckCircle2 }].map((a) => {
                                      const AIcon = a.icon;
                                      return (
                                        <button key={a.label} onClick={() => setActionMenuRow(null)} className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${(a as { danger?: boolean }).danger ? "text-[#ef4444] hover:bg-[#fef2f2]" : "text-[#334155]"}`}>
                                          <AIcon size={13} className={(a as { danger?: boolean }).danger ? "text-[#ef4444]" : "text-[#94a3b8]"} />
                                          {a.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#f1f5f9]">
              <span className="text-sm text-[#64748b]">
                Showing{" "}
                <span className="font-semibold text-[#334155]">{Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}</span>
                {" – "}
                <span className="font-semibold text-[#334155]">{Math.min(currentPage * pageSize, sortedData.length)}</span>
                {" of "}
                <span className="font-semibold text-[#334155]">{sortedData.length}</span> records
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronsLeft size={13} /></button>
                <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={13} /></button>
                {getPageNums().map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[#94a3b8] text-sm">…</span>
                  ) : (
                    <button key={p} onClick={() => setCurrentPage(p as number)} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${currentPage === p ? "bg-[#1a56db] text-white font-semibold shadow-sm" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}>{p}</button>
                  )
                )}
                <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={13} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronsRight size={13} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Resolution Workflow Panel ── */}
        <div className="w-80 flex-shrink-0 space-y-4 sticky top-6">
          {activeException ? (
            <>
              {/* Exception Detail Card */}
              <div className={`bg-white rounded-xl border ${PRIORITY_CONFIG[activeException.priority].cardBorder} shadow-sm overflow-hidden`}>
                {/* Header stripe */}
                <div className={`${PRIORITY_CONFIG[activeException.priority].bg} border-b ${PRIORITY_CONFIG[activeException.priority].border} px-4 py-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${PRIORITY_CONFIG[activeException.priority].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[activeException.priority].dot}`} />
                          {PRIORITY_CONFIG[activeException.priority].label}
                        </span>
                      </div>
                      <p className="font-mono text-sm font-bold text-[#0f172a]">{activeException.caseId}</p>
                    </div>
                    <button onClick={() => setActiveException(null)} className="text-[#94a3b8] hover:text-[#475569] transition-colors flex-shrink-0 mt-0.5">
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Exception details */}
                <div className="px-4 py-3 space-y-3">
                  <p className="text-xs text-[#475569] leading-relaxed">{activeException.description}</p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Type", value: activeException.exceptionType },
                      { label: "Amount", value: formatCurrencyFull(activeException.amount, activeException.currency) },
                      { label: "Account", value: activeException.account },
                      { label: "Bank", value: activeException.bank },
                      { label: "Age", value: `${activeException.age} day${activeException.age !== 1 ? "s" : ""}` },
                      { label: "Due Date", value: activeException.dueDate },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#f8fafc] rounded-lg px-2.5 py-2">
                        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-xs font-medium text-[#334155] leading-tight">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Assignee + status */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center text-[10px] font-bold text-[#1d4ed8]">
                        {activeException.assigneeInitials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#334155]">{activeException.assignee}</p>
                        <p className="text-[10px] text-[#94a3b8]">Last: {activeException.lastActivity}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[activeException.status].bg} ${STATUS_CONFIG[activeException.status].text}`}>
                      {STATUS_CONFIG[activeException.status].label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Workflow */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f1f5f9] bg-[#fafbfc]">
                  <FileCheck size={14} className="text-[#1a56db]" />
                  <span className="text-sm font-semibold text-[#334155]">Resolution Workflow</span>
                  <span className="ml-auto text-xs text-[#94a3b8]">Select action</span>
                </div>
                <div className="p-3 space-y-2">
                  {RESOLUTION_ACTIONS.map((action) => {
                    const AIcon = action.icon;
                    const isChosen = resolvedAction === action.id;
                    return (
                      <button
                        key={action.id}
                        onClick={() => setResolvedAction(isChosen ? null : action.id)}
                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 ${isChosen ? `${action.bg} ${action.border} shadow-sm` : `bg-white border-[#f1f5f9] hover:border-[#e2e8f0] hover:bg-[#f8fafc]`}`}
                      >
                        <div className={`w-7 h-7 ${action.bg} ${action.border} border rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <AIcon size={13} className={action.color} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${isChosen ? action.color : "text-[#334155]"}`}>{action.label}</p>
                          <p className="text-[11px] text-[#94a3b8] leading-snug mt-0.5 line-clamp-2">{action.desc}</p>
                        </div>
                        {isChosen && <div className={`w-2 h-2 rounded-full ${action.color.replace("text-", "bg-")} flex-shrink-0 mt-2`} />}
                      </button>
                    );
                  })}
                </div>

                {/* Comment + Submit */}
                <div className="px-3 pb-3 space-y-2">
                  <div className="border-t border-[#f1f5f9] pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={12} className="text-[#94a3b8]" />
                      <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Resolution Notes</label>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add notes for audit trail…"
                      className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 focus:bg-white text-[#334155] placeholder:text-[#cbd5e1] transition-all resize-none"
                    />
                  </div>
                  <button
                    disabled={!resolvedAction}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileCheck size={14} />
                    {resolvedAction
                      ? `Apply: ${RESOLUTION_ACTIONS.find((a) => a.id === resolvedAction)?.label}`
                      : "Select an action above"}
                  </button>
                  {resolvedAction && (
                    <p className="text-[10px] text-[#94a3b8] text-center">
                      This action will be logged in the compliance audit trail
                    </p>
                  )}
                </div>
              </div>

              {/* Audit trail mini */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#f1f5f9] bg-[#fafbfc]">
                  <Activity size={13} className="text-[#64748b]" />
                  <span className="text-xs font-semibold text-[#334155]">Activity Log</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {[
                    { user: activeException.assigneeInitials, action: "Exception created", time: activeException.createdDate, color: "bg-[#dbeafe] text-[#1d4ed8]" },
                    { user: "SY", action: "Auto-match attempted — no match found", time: `${activeException.createdDate}`, color: "bg-[#fef3c7] text-[#b45309]" },
                    { user: activeException.assigneeInitials, action: "Assigned for manual review", time: activeException.lastActivity, color: "bg-[#dcfce7] text-[#15803d]" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full ${entry.color} flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5`}>
                        {entry.user}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#334155] leading-snug">{entry.action}</p>
                        <p className="text-[10px] text-[#94a3b8] mt-0.5">{entry.time}</p>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-1 text-xs text-[#1a56db] hover:underline pt-1">
                    View full audit trail <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-[#f1f5f9] rounded-xl flex items-center justify-center">
                <FileCheck size={22} className="text-[#94a3b8]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#334155]">No exception selected</p>
                <p className="text-xs text-[#94a3b8] mt-1">Click any row in the table to open the resolution workflow panel</p>
              </div>
              <div className="w-full space-y-1.5 mt-2">
                {RESOLUTION_ACTIONS.map((a) => {
                  const AIcon = a.icon;
                  return (
                    <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                      <AIcon size={13} className={a.color} />
                      <span className="text-xs text-[#64748b]">{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
