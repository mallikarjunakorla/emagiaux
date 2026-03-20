import { useState, useMemo, useCallback } from "react";
import {
  Zap,
  Search,
  Download,
  RefreshCw,
  ArrowLeftRight,
  ChevronDown,
  CalendarDays,
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Link2,
  MoreHorizontal,
  TrendingUp,
  FileText,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  Layers,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type TxStatus = "matched" | "unmatched" | "review";

interface MatchedTransaction {
  id: string;
  txnId: string;
  date: string;
  description: string;
  counterparty: string;
  bankAmount: number | null;
  glAmount: number | null;
  currency: string;
  variance: number;
  confidence: number | null;
  status: TxStatus;
  account: string;
  bank: string;
  category: string;
  reviewer?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const allTransactions: MatchedTransaction[] = [
  { id: "1", txnId: "TXN-2026-084721", date: "2026-03-13", description: "Wire Transfer – Invoice #INV-0482", counterparty: "Apple Inc.", bankAmount: 1_245_800.00, glAmount: 1_245_800.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Operating – USD Primary", bank: "JPMorgan Chase", category: "Revenue", reviewer: "J. Carter" },
  { id: "2", txnId: "TXN-2026-084655", date: "2026-03-13", description: "ACH Debit – MSFT License Q1", counterparty: "Microsoft Corp.", bankAmount: 348_200.50, glAmount: 348_205.00, currency: "USD", variance: -4.50, confidence: 87, status: "review", account: "Payroll – USD", bank: "Bank of America", category: "Software", reviewer: "M. Patel" },
  { id: "3", txnId: "TXN-2026-084601", date: "2026-03-13", description: "Credit – AWS Cloud Services", counterparty: "Amazon AWS", bankAmount: 89_450.00, glAmount: 89_450.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Operating – USD Primary", bank: "Citibank", category: "Cloud Infra" },
  { id: "4", txnId: "TXN-2026-084522", date: "2026-03-13", description: "Outbound Wire – Trading Settlement", counterparty: "Goldman Sachs", bankAmount: 2_100_000.00, glAmount: null, currency: "USD", variance: 2_100_000.00, confidence: null, status: "unmatched", account: "Treasury – USD Reserve", bank: "JPMorgan Chase", category: "Settlement" },
  { id: "5", txnId: "TXN-2026-084490", date: "2026-03-12", description: "Payment Processing Fee – Mar", counterparty: "Stripe Inc.", bankAmount: 67_320.75, glAmount: 67_320.75, currency: "USD", variance: 0, confidence: 98, status: "matched", account: "Operating – USD Primary", bank: "Wells Fargo", category: "Fees" },
  { id: "6", txnId: "TXN-2026-084411", date: "2026-03-12", description: "Ad Spend – Q1 Campaign", counterparty: "Meta Platforms", bankAmount: 512_900.00, glAmount: null, currency: "USD", variance: 512_900.00, confidence: null, status: "unmatched", account: "Capex – USD", bank: "Bank of America", category: "Marketing" },
  { id: "7", txnId: "TXN-2026-084388", date: "2026-03-12", description: "SaaS Subscription – Annual", counterparty: "Salesforce Inc.", bankAmount: 28_750.00, glAmount: 28_750.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Operating – USD Primary", bank: "Citibank", category: "Software" },
  { id: "8", txnId: "TXN-2026-084301", date: "2026-03-11", description: "EV Fleet Deposit – Q2", counterparty: "Tesla Inc.", bankAmount: 876_300.00, glAmount: 912_000.00, currency: "USD", variance: -35_700.00, confidence: 42, status: "review", account: "Capex – USD", bank: "JPMorgan Chase", category: "Equipment", reviewer: "R. Thompson" },
  { id: "9", txnId: "TXN-2026-084270", date: "2026-03-11", description: "FX Transfer – EUR Conversion", counterparty: "Deutsche Bank", bankAmount: 1_890_000.00, glAmount: 1_890_000.00, currency: "EUR", variance: 0, confidence: 96, status: "matched", account: "Hedging – EUR", bank: "Deutsche Bank", category: "FX" },
  { id: "10", txnId: "TXN-2026-084201", date: "2026-03-11", description: "Vendor Payment – Q1 Services", counterparty: "Accenture LLP", bankAmount: 415_000.00, glAmount: null, currency: "USD", variance: 415_000.00, confidence: null, status: "unmatched", account: "Operating – USD Primary", bank: "Wells Fargo", category: "Consulting" },
  { id: "11", txnId: "TXN-2026-084155", date: "2026-03-10", description: "Dividend Receivable – Q4", counterparty: "Berkshire Hathaway", bankAmount: 3_200_000.00, glAmount: 3_200_000.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Investments – USD", bank: "Morgan Stanley", category: "Dividends" },
  { id: "12", txnId: "TXN-2026-084110", date: "2026-03-10", description: "Insurance Premium – Annual", counterparty: "AIG Corp.", bankAmount: 184_500.00, glAmount: 183_000.00, currency: "USD", variance: 1_500.00, confidence: 73, status: "review", account: "Operating – USD Primary", bank: "Bank of America", category: "Insurance", reviewer: "A. Kim" },
  { id: "13", txnId: "TXN-2026-084089", date: "2026-03-10", description: "Payroll Disbursement – Feb Final", counterparty: "ADP Payroll Services", bankAmount: 5_720_000.00, glAmount: 5_720_000.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Payroll – USD", bank: "Bank of America", category: "Payroll" },
  { id: "14", txnId: "TXN-2026-084042", date: "2026-03-09", description: "Intercompany Loan Repayment", counterparty: "Corp HoldCo Ltd.", bankAmount: 8_500_000.00, glAmount: null, currency: "USD", variance: 8_500_000.00, confidence: null, status: "unmatched", account: "Intercompany – USD", bank: "Goldman Sachs", category: "Interco" },
  { id: "15", txnId: "TXN-2026-083990", date: "2026-03-09", description: "Tax Withholding – Q1 Estimate", counterparty: "IRS / US Treasury", bankAmount: 2_480_000.00, glAmount: 2_480_000.00, currency: "USD", variance: 0, confidence: 99, status: "matched", account: "Tax Escrow – USD", bank: "JPMorgan Chase", category: "Tax" },
  { id: "16", txnId: "TXN-2026-083944", date: "2026-03-08", description: "Data Center Lease – March", counterparty: "Equinix Inc.", bankAmount: 312_400.00, glAmount: 310_000.00, currency: "USD", variance: 2_400.00, confidence: 81, status: "review", account: "Capex – USD", bank: "Citibank", category: "Real Estate", reviewer: "S. Nguyen" },
  { id: "17", txnId: "TXN-2026-083900", date: "2026-03-08", description: "Bond Coupon Receipt – Mar 8", counterparty: "US Treasury Bonds", bankAmount: 640_000.00, glAmount: 640_000.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Investments – USD", bank: "Morgan Stanley", category: "Fixed Income" },
  { id: "18", txnId: "TXN-2026-083855", date: "2026-03-07", description: "Logistics & Freight – Feb", counterparty: "FedEx Corp.", bankAmount: 76_800.00, glAmount: null, currency: "USD", variance: 76_800.00, confidence: null, status: "unmatched", account: "Operating – USD Primary", bank: "Wells Fargo", category: "Logistics" },
  { id: "19", txnId: "TXN-2026-083801", date: "2026-03-07", description: "Credit Card Settlement – Amex", counterparty: "American Express", bankAmount: 228_150.00, glAmount: 228_150.00, currency: "USD", variance: 0, confidence: 97, status: "matched", account: "Operating – USD Primary", bank: "JPMorgan Chase", category: "Credit Card" },
  { id: "20", txnId: "TXN-2026-083750", date: "2026-03-06", description: "Capex Purchase – Server HW", counterparty: "Dell Technologies", bankAmount: 1_120_000.00, glAmount: 1_094_800.00, currency: "USD", variance: 25_200.00, confidence: 55, status: "review", account: "Capex – USD", bank: "Citibank", category: "Hardware", reviewer: "M. Patel" },
  { id: "21", txnId: "TXN-2026-083700", date: "2026-03-06", description: "Professional Services – Legal", counterparty: "Latham & Watkins LLP", bankAmount: 390_000.00, glAmount: 390_000.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Operating – USD Primary", bank: "Bank of America", category: "Legal" },
  { id: "22", txnId: "TXN-2026-083650", date: "2026-03-05", description: "SGD Operating Transfer", counterparty: "DBS Bank APAC", bankAmount: null, glAmount: 4_985_600.00, currency: "SGD", variance: -4_985_600.00, confidence: null, status: "unmatched", account: "Operating – SGD", bank: "DBS Bank", category: "FX" },
  { id: "23", txnId: "TXN-2026-083600", date: "2026-03-05", description: "Royalty Revenue – Q4 Final", counterparty: "Warner Music Group", bankAmount: 54_200.00, glAmount: 54_200.00, currency: "USD", variance: 0, confidence: 100, status: "matched", account: "Operating – USD Primary", bank: "JPMorgan Chase", category: "Revenue" },
  { id: "24", txnId: "TXN-2026-083540", date: "2026-03-04", description: "Retirement Fund Contribution", counterparty: "Vanguard Group", bankAmount: 1_880_000.00, glAmount: 1_875_000.00, currency: "USD", variance: 5_000.00, confidence: 79, status: "review", account: "Payroll – USD", bank: "Wells Fargo", category: "Benefits", reviewer: "J. Carter" },
  { id: "25", txnId: "TXN-2026-083480", date: "2026-03-03", description: "Swift Transfer – CHF Vendor", counterparty: "UBS AG Switzerland", bankAmount: 2_140_500.00, glAmount: 2_155_000.00, currency: "CHF", variance: -14_500.00, confidence: 62, status: "review", account: "Vendor Payments – CHF", bank: "UBS", category: "Vendor", reviewer: "R. Thompson" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null, currency = "USD"): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getConfidenceColor(score: number | null): {
  bar: string;
  text: string;
  bg: string;
  label: string;
} {
  if (score === null) return { bar: "bg-[#e2e8f0]", text: "text-[#94a3b8]", bg: "bg-[#f8fafc]", label: "N/A" };
  if (score === 100) return { bar: "bg-[#22c55e]", text: "text-[#15803d]", bg: "bg-[#dcfce7]", label: "Exact" };
  if (score >= 90) return { bar: "bg-[#3b82f6]", text: "text-[#1d4ed8]", bg: "bg-[#dbeafe]", label: "High" };
  if (score >= 75) return { bar: "bg-[#0ea5e9]", text: "text-[#0369a1]", bg: "bg-[#e0f2fe]", label: "Good" };
  if (score >= 55) return { bar: "bg-[#f59e0b]", text: "text-[#b45309]", bg: "bg-[#fef3c7]", label: "Fair" };
  return { bar: "bg-[#ef4444]", text: "text-[#b91c1c]", bg: "bg-[#fee2e2]", label: "Low" };
}

const STATUS_CONFIG: Record<TxStatus, { label: string; bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  matched: { label: "Matched", bg: "bg-[#dcfce7]", text: "text-[#15803d]", dot: "bg-[#22c55e]", icon: CheckCircle2 },
  unmatched: { label: "Unmatched", bg: "bg-[#fee2e2]", text: "text-[#b91c1c]", dot: "bg-[#ef4444]", icon: AlertCircle },
  review: { label: "Review", bg: "bg-[#fef3c7]", text: "text-[#b45309]", dot: "bg-[#f59e0b]", icon: Clock },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfidenceBar({ score }: { score: number | null }) {
  const c = getConfidenceColor(score);
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: score !== null ? `${score}%` : "0%" }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums w-8 text-right ${c.text}`}>
        {score !== null ? `${score}%` : "—"}
      </span>
    </div>
  );
}

function StatusBadgeInline({ status }: { status: TxStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type SortKey = keyof MatchedTransaction | null;

export function TransactionMatching() {
  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TxStatus>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Table state
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [actionMenuRow, setActionMenuRow] = useState<string | null>(null);

  // Auto-match animation
  const [autoMatching, setAutoMatching] = useState(false);
  const [autoMatchComplete, setAutoMatchComplete] = useState(false);

  // ── Derived: KPIs ──
  const totalItems = allTransactions.length;
  const matchedCount = allTransactions.filter((t) => t.status === "matched").length;
  const unmatchedCount = allTransactions.filter((t) => t.status === "unmatched").length;
  const reviewCount = allTransactions.filter((t) => t.status === "review").length;
  const avgConfidence = Math.round(
    allTransactions.filter((t) => t.confidence !== null).reduce((s, t) => s + (t.confidence ?? 0), 0) /
    allTransactions.filter((t) => t.confidence !== null).length
  );

  // ── Filter + Sort ──
  const filteredData = useMemo(() => {
    return allTransactions.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.txnId.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !t.counterparty.toLowerCase().includes(q) &&
          !t.account.toLowerCase().includes(q) &&
          !t.bank.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      const cmp = (aVal as any) < (bVal as any) ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return sortedData.slice(s, s + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // ── Handlers ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedRows(checked ? new Set(pagedData.map((r) => r.id)) : new Set());
  }, [pagedData]);

  const handleAutoMatch = () => {
    setAutoMatching(true);
    setAutoMatchComplete(false);
    setTimeout(() => {
      setAutoMatching(false);
      setAutoMatchComplete(true);
      setTimeout(() => setAutoMatchComplete(false), 3500);
    }, 2200);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const activeFilterCount = [statusFilter, dateFrom, dateTo, searchQuery].filter(Boolean).length;

  const allPageSelected = pagedData.length > 0 && pagedData.every((r) => selectedRows.has(r.id));
  const somePageSelected = pagedData.some((r) => selectedRows.has(r.id));

  // ── Sort Icon helper ──
  const SortIcon = ({ k }: { k: string }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="text-[#cbd5e1]" />;
    return sortDir === "asc"
      ? <ArrowUp size={12} className="text-[#1a56db]" />
      : <ArrowDown size={12} className="text-[#1a56db]" />;
  };

  // ── Pagination helpers ──
  const getPageNums = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="p-6 space-y-5 min-h-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[#0f172a]">Transaction Matching</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            AI-assisted reconciliation between bank statements and general ledger &nbsp;·&nbsp;
            <span className="text-[#94a3b8]">Last run: Today, 09:45 EST</span>
          </p>
        </div>
        {/* <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all shadow-sm">
            <ArrowLeftRight size={14} />
            Manual Match
          </button>
          <button
            onClick={handleAutoMatch}
            disabled={autoMatching}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {autoMatching ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : autoMatchComplete ? (
              <CheckCircle2 size={14} className="text-[#86efac]" />
            ) : (
              <Zap size={14} />
            )}
            {autoMatching ? "Running…" : autoMatchComplete ? "Complete!" : "Auto-Match"}
          </button>
        </div> */}
      </div>

      {/* ── Auto-match success toast ── */}
      {autoMatchComplete && (
        <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-sm text-[#15803d]">
          <CheckCircle2 size={16} className="text-[#22c55e] flex-shrink-0" />
          <span>
            Auto-match complete — <span className="font-semibold">18 new matches</span> identified.
            Confidence threshold: <span className="font-semibold">≥85%</span>.
          </span>
          <button onClick={() => setAutoMatchComplete(false)} className="ml-auto text-[#86efac] hover:text-[#15803d]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Matching Rules Banner ── */}
      {/* <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 bg-[#1a56db] rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#1e40af]">6 Matching Rules Active</div>
            <div className="text-xs text-[#60a5fa] mt-0.5 truncate">
              Exact amount + date &nbsp;·&nbsp; Reference fuzzy (≥85%) &nbsp;·&nbsp; Counterparty normalisation &nbsp;·&nbsp; ±$0.01 tolerance &nbsp;·&nbsp; 2-day date window &nbsp;·&nbsp; Currency conversion
            </div>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs font-semibold text-[#1a56db] hover:underline flex-shrink-0">
          Configure <ChevronRight size={12} />
        </button>
      </div> */}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: "Total Items",
            value: totalItems,
            sub: "Across all accounts",
            icon: Layers,
            iconBg: "bg-[#f1f5f9]",
            iconColor: "text-[#475569]",
            valueCls: "text-[#0f172a]",
            border: "border-[#e2e8f0]",
            active: statusFilter === "",
            onClick: () => { setStatusFilter(""); setCurrentPage(1); },
          },
          {
            label: "Matched",
            value: matchedCount,
            sub: `${((matchedCount / totalItems) * 100).toFixed(1)}% match rate`,
            icon: CheckCircle2,
            iconBg: "bg-[#dcfce7]",
            iconColor: "text-[#15803d]",
            valueCls: "text-[#15803d]",
            border: "border-[#bbf7d0]",
            active: statusFilter === "matched",
            onClick: () => { setStatusFilter(statusFilter === "matched" ? "" : "matched"); setCurrentPage(1); },
          },
          {
            label: "Unmatched",
            value: unmatchedCount,
            sub: "Requires attention",
            icon: AlertCircle,
            iconBg: "bg-[#fee2e2]",
            iconColor: "text-[#b91c1c]",
            valueCls: "text-[#b91c1c]",
            border: "border-[#fecaca]",
            active: statusFilter === "unmatched",
            onClick: () => { setStatusFilter(statusFilter === "unmatched" ? "" : "unmatched"); setCurrentPage(1); },
          },
          {
            label: "Under Review",
            value: reviewCount,
            sub: `Avg. confidence: ${avgConfidence}%`,
            icon: Clock,
            iconBg: "bg-[#fef3c7]",
            iconColor: "text-[#b45309]",
            valueCls: "text-[#b45309]",
            border: "border-[#fde68a]",
            active: statusFilter === "review",
            onClick: () => { setStatusFilter(statusFilter === "review" ? "" : "review"); setCurrentPage(1); },
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className={`bg-white rounded-xl border ${card.border} p-4 text-left shadow-sm hover:shadow-md transition-all duration-200 group ${card.active ? "ring-2 ring-[#1a56db] ring-offset-1" : ""}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  {card.label}
                </p>
                <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={card.iconColor} strokeWidth={2} />
                </div>
              </div>
              <div className={`text-2xl font-bold tracking-tight ${card.valueCls}`}>
                {card.value.toLocaleString()}
              </div>
              <div className="text-xs text-[#94a3b8] mt-0.5">{card.sub}</div>
              {/* mini progress bar */}
              <div className="mt-3 h-1 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${card.iconBg.replace("bg-", "bg-").replace("[#", "[#")} transition-all duration-700`}
                  style={{
                    width: `${(card.value / totalItems) * 100}%`,
                    background: card.iconColor.replace("text-", "").replace("[", "").replace("]", ""),
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Toolbar header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[#64748b]" />
            <span className="text-sm font-medium text-[#334155]">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#1a56db] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Search – always visible */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search ID, description, counterparty…"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 focus:bg-white text-[#334155] placeholder:text-[#cbd5e1] transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-[#ef4444] hover:text-[#dc2626] px-2 py-1 rounded hover:bg-[#fef2f2] transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
            <span className="text-xs text-[#64748b]">
              <span className="font-semibold text-[#334155]">{filteredData.length.toLocaleString()}</span> results
            </span>
            <button
              onClick={() => setFiltersExpanded((p) => !p)}
              className="flex items-center gap-1 text-xs text-[#1a56db] hover:text-[#1d4ed8] transition-colors"
            >
              {filtersExpanded ? "Hide" : "Show"} filters
              <ChevronDown size={12} className={`transition-transform duration-200 ${filtersExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter fields */}
        {filtersExpanded && (
          <div className="flex flex-wrap items-end gap-4 px-4 py-3">
            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as "" | TxStatus); setCurrentPage(1); }}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all cursor-pointer min-w-[140px]"
                >
                  <option value="">All Statuses</option>
                  <option value="matched">Matched</option>
                  <option value="unmatched">Unmatched</option>
                  <option value="review">Review</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              </div>
            </div>

            {/* Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Date From</label>
              <div className="relative">
                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Date To</label>
              <div className="relative">
                <CalendarDays size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center pb-0.5">
                {statusFilter && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs rounded-full">
                    <span className="text-[#60a5fa]">Status:</span>
                    {STATUS_CONFIG[statusFilter].label}
                    <button onClick={() => setStatusFilter("")} className="hover:text-[#1e40af]"><X size={11} /></button>
                  </span>
                )}
                {dateFrom && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs rounded-full">
                    <span className="text-[#60a5fa]">From:</span>{dateFrom}
                    <button onClick={() => setDateFrom("")} className="hover:text-[#1e40af]"><X size={11} /></button>
                  </span>
                )}
                {dateTo && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs rounded-full">
                    <span className="text-[#60a5fa]">To:</span>{dateTo}
                    <button onClick={() => setDateTo("")} className="hover:text-[#1e40af]"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main Transaction Table ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9] bg-[#fafbfc]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[#64748b]" />
              <span className="text-sm font-semibold text-[#334155]">Transaction Matching Table</span>
            </div>
            {selectedRows.size > 0 && (
              <span className="bg-[#1a56db] text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {selectedRows.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15803d] bg-[#dcfce7] border border-[#bbf7d0] rounded-lg hover:bg-[#bbf7d0] transition-colors">
                  <Link2 size={12} /> Match Selected
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#b45309] bg-[#fef3c7] border border-[#fde68a] rounded-lg hover:bg-[#fde68a] transition-colors">
                  <Clock size={12} /> Flag Review
                </button>
                <div className="w-px h-5 bg-[#e2e8f0]" />
              </>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <TrendingUp size={12} /> Avg confidence:
              <span className="font-semibold text-[#334155]">{avgConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {/* Checkbox */}
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-[#cbd5e1] accent-[#1a56db] cursor-pointer"
                  />
                </th>
                {/* # */}
                <th className="w-8 px-2 py-3">
                  <Hash size={12} className="text-[#cbd5e1]" />
                </th>
                {(
                  [
                    { key: "txnId", label: "Transaction ID", w: "160px" },
                    { key: "date", label: "Date", w: "100px" },
                    { key: "description", label: "Description", w: "220px" },
                    { key: "bankAmount", label: "Bank Amount", w: "130px", right: true },
                    { key: "glAmount", label: "GL Amount", w: "130px", right: true },
                    { key: "variance", label: "Variance", w: "110px", right: true },
                    { key: "confidence", label: "Confidence", w: "150px" },
                    { key: "status", label: "Status", w: "115px", center: true },
                  ] as { key: string; label: string; w: string; right?: boolean; center?: boolean }[]
                ).map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.w }}
                    className={`px-3 py-3 ${col.right ? "text-right" : col.center ? "text-center" : "text-left"}`}
                  >
                    <button
                      onClick={() => handleSort(col.key as SortKey)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#64748b] hover:text-[#334155] transition-colors group ${col.right ? "flex-row-reverse" : ""}`}
                    >
                      {col.label}
                      <SortIcon k={col.key} />
                    </button>
                  </th>
                ))}
                {/* Actions col */}
                <th className="w-14 px-3 py-3" />
              </tr>
            </thead>

            <tbody>
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-[#94a3b8] text-sm">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                pagedData.map((row, i) => {
                  const isSelected = selectedRows.has(row.id);
                  const isUnmatched = row.status === "unmatched";
                  const isReview = row.status === "review";
                  const rowBase = isSelected
                    ? "bg-[#eff6ff]"
                    : isUnmatched
                    ? "bg-[#fff8f8] hover:bg-[#fef2f2]"
                    : isReview
                    ? "bg-[#fffef8] hover:bg-[#fffbeb]"
                    : "hover:bg-[#f8fafc]";

                  const startIdx = (currentPage - 1) * pageSize + i + 1;

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-[#f1f5f9] transition-colors duration-100 cursor-default ${rowBase} ${i === pagedData.length - 1 ? "border-b-0" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 rounded border-[#cbd5e1] accent-[#1a56db] cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="px-2 py-2.5 text-xs text-[#cbd5e1] tabular-nums">{startIdx}</td>

                      {/* Transaction ID */}
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs text-[#1a56db] hover:underline cursor-pointer whitespace-nowrap">
                            {row.txnId}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">{row.bank}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-[#475569] tabular-nums whitespace-nowrap">
                          {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-3 py-2.5 max-w-[220px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-[#0f172a] leading-snug line-clamp-1" title={row.description}>
                            {row.description}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">{row.counterparty} &middot; {row.category}</span>
                        </div>
                      </td>

                      {/* Bank Amount */}
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-mono text-sm font-medium whitespace-nowrap ${row.bankAmount !== null ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>
                          {formatCurrency(row.bankAmount, row.currency)}
                        </span>
                      </td>

                      {/* GL Amount */}
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-mono text-sm whitespace-nowrap ${row.glAmount !== null ? "text-[#334155]" : "text-[#94a3b8]"}`}>
                          {formatCurrency(row.glAmount, row.currency)}
                        </span>
                      </td>

                      {/* Variance */}
                      <td className="px-3 py-2.5 text-right">
                        {row.variance === 0 ? (
                          <span className="text-xs text-[#22c55e] font-semibold">—</span>
                        ) : (
                          <span className={`font-mono text-xs whitespace-nowrap ${Math.abs(row.variance) > 10000 ? "text-[#b91c1c]" : "text-[#b45309]"}`}>
                            {row.variance > 0 ? "+" : ""}
                            {formatCurrency(row.variance, row.currency)}
                          </span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="px-3 py-2.5">
                        {row.confidence !== null ? (
                          <div className="flex flex-col gap-1">
                            <ConfidenceBar score={row.confidence} />
                            <span className={`text-[10px] font-semibold ${getConfidenceColor(row.confidence).text}`}>
                              {getConfidenceColor(row.confidence).label} match
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#cbd5e1] italic">No match found</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadgeInline status={row.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 relative">
                        <div className="flex items-center gap-1">
                          <button
                            title="View details"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569] transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setActionMenuRow(actionMenuRow === row.id ? null : row.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569] transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                        {actionMenuRow === row.id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setActionMenuRow(null)} />
                            <div className="absolute right-3 top-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 py-1 min-w-[160px]">
                              {[
                                { label: "View Details", icon: Eye, danger: false },
                                { label: "Manual Match", icon: Link2, danger: false },
                                { label: "Flag for Review", icon: Clock, danger: false },
                                // { label: "Mark as Exception", icon: AlertCircle, danger: true },
                              ].map((a) => {
                                const AIcon = a.icon;
                                return (
                                  <button
                                    key={a.label}
                                    onClick={() => setActionMenuRow(null)}
                                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${a.danger ? "text-[#ef4444] hover:bg-[#fef2f2]" : "text-[#334155]"}`}
                                  >
                                    <AIcon size={13} className={a.danger ? "text-[#ef4444]" : "text-[#94a3b8]"} />
                                    {a.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#f1f5f9] bg-white">
          <div className="flex items-center gap-3 text-sm text-[#64748b]">
            <span>
              Showing{" "}
              <span className="font-semibold text-[#334155]">
                {Math.min((currentPage - 1) * pageSize + 1, sortedData.length).toLocaleString()}
              </span>
              {" – "}
              <span className="font-semibold text-[#334155]">
                {Math.min(currentPage * pageSize, sortedData.length).toLocaleString()}
              </span>
              {" of "}
              <span className="font-semibold text-[#334155]">{sortedData.length.toLocaleString()}</span> records
            </span>
            <span className="text-[#cbd5e1]">|</span>
            <label className="flex items-center gap-2 text-xs text-[#94a3b8]">
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs px-2 py-1 border border-[#e2e8f0] rounded-md bg-[#f8fafc] text-[#334155] outline-none focus:border-[#1a56db] cursor-pointer"
              >
                {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={14} />
            </button>
            {getPageNums().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[#94a3b8] text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${currentPage === p ? "bg-[#1a56db] text-white font-semibold shadow-sm" : "text-[#64748b] hover:bg-[#f1f5f9]"}`}
                >
                  {p}
                </button>
              )
            )}
            <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Bulk Action Bar ── */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0b1426] text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 border border-[#1e2d4a] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1a56db] rounded-md flex items-center justify-center">
              <span className="text-xs font-bold">{selectedRows.size}</span>
            </div>
            <span className="text-sm text-[#94a3b8]">transaction{selectedRows.size > 1 ? "s" : ""} selected</span>
          </div>
          <div className="w-px h-5 bg-[#1e3a5f]" />
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e] rounded-lg text-sm font-semibold text-white hover:bg-[#16a34a] transition-colors">
            <Link2 size={13} /> Match
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] rounded-lg text-sm font-semibold text-white hover:bg-[#d97706] transition-colors">
            <Clock size={13} /> Review
          </button>
          {<button className="flex items-center gap-2 px-3 py-1.5 bg-[#ef4444] rounded-lg text-sm font-semibold text-white hover:bg-[#dc2626] transition-colors">
            <AlertCircle size={13} /> Exception
          </button>}
          <div className="w-px h-5 bg-[#1e3a5f]" />
          <button
            onClick={() => setSelectedRows(new Set())}
            className="text-xs text-[#64748b] hover:text-white transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
