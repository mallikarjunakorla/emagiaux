import { useState, useMemo } from "react";
import {
  Building2,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
  Landmark,
  BookOpen,
  TrendingDown,
  Scale,
  Wallet,
  Printer,
  FileCheck2,
} from "lucide-react";
import { KpiCard } from "../components/ui/KpiCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DataTable, Column } from "../components/ui/DataTable";
import { BalanceSummaryCard } from "../components/ui/BalanceSummaryCard";
import {
  AdjustmentAttributesTable,
  type AdjustmentRow,
  type NewAdjustmentRow,
} from "../components/ui/AdjustmentAttributesTable";
import { ReconciliationSummaryPanel } from "../components/ui/ReconciliationSummaryPanel";

// ── Types ──────────────────────────────────────────────────────────────────────

interface BankAccount extends Record<string, unknown> {
  id: string;
  account: string;
  accountNo: string;
  bank: string;
  currency: string;
  bankBalance: number;
  glBalance: number;
  variance: number;
  status: "reconciled" | "in-progress" | "exception";
  lastReconciled: string;
  analyst: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const bankAccounts: BankAccount[] = [
  { id: "BA001", account: "Operating — USD Primary",    accountNo: "****4821", bank: "JPMorgan Chase",  currency: "USD", bankBalance: 48_320_450.00, glBalance: 48_320_450.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "J. Carter"   },
  { id: "BA002", account: "Payroll — USD",              accountNo: "****2290", bank: "Bank of America", currency: "USD", bankBalance: 12_874_100.50, glBalance: 12_891_340.50, variance:  -17_240.00, status: "in-progress",   lastReconciled: "Mar 12, 2026", analyst: "M. Patel"    },
  { id: "BA003", account: "Collections — USD",          accountNo: "****7731", bank: "Citibank",        currency: "USD", bankBalance:  9_450_000.00, glBalance:  9_450_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA004", account: "Treasury — USD Reserve",     accountNo: "****5503", bank: "Wells Fargo",     currency: "USD", bankBalance: 25_100_000.00, glBalance: 25_100_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "J. Carter"   },
  { id: "BA005", account: "Disbursements — USD",        accountNo: "****8847", bank: "HSBC",            currency: "USD", bankBalance:  6_220_780.25, glBalance:  6_198_450.00, variance:   22_330.25, status: "in-progress",   lastReconciled: "Mar 11, 2026", analyst: "R. Thompson" },
  { id: "BA006", account: "Intercompany — USD",         accountNo: "****1192", bank: "Goldman Sachs",   currency: "USD", bankBalance:  4_500_000.00, glBalance:  4_498_150.00, variance:    1_850.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "A. Kim"      },
  { id: "BA007", account: "Tax Escrow — USD",           accountNo: "****3374", bank: "JPMorgan Chase",  currency: "USD", bankBalance:  3_812_900.00, glBalance:  3_812_900.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "M. Patel"    },
  { id: "BA008", account: "Investments — USD",          accountNo: "****6690", bank: "Morgan Stanley",  currency: "USD", bankBalance: 18_750_000.00, glBalance: 18_750_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA009", account: "Vendor Payments — USD",      accountNo: "****0928", bank: "UBS",             currency: "USD", bankBalance:  2_140_500.00, glBalance:  2_155_000.00, variance:  -14_500.00, status: "in-progress",   lastReconciled: "Mar 10, 2026", analyst: "R. Thompson" },
  { id: "BA010", account: "Revenue — USD",              accountNo: "****4417", bank: "TD Bank",         currency: "USD", bankBalance:  7_630_200.00, glBalance:  7_630_200.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "A. Kim"      },
  { id: "BA011", account: "Capex — USD",                accountNo: "****7755", bank: "Citibank",        currency: "USD", bankBalance: 11_200_000.00, glBalance: 11_194_800.00, variance:    5_200.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "J. Carter"   },
  { id: "BA012", account: "Operating — USD",            accountNo: "****3308", bank: "DBS Bank",        currency: "USD", bankBalance:  4_985_600.00, glBalance:  4_985_600.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "M. Patel"    },
  { id: "BA013", account: "Hedging — USD",              accountNo: "****2261", bank: "Deutsche Bank",   currency: "USD", bankBalance:  8_900_000.00, glBalance:  8_900_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA014", account: "Petty Cash — USD",           accountNo: "****9912", bank: "Bank of America", currency: "USD", bankBalance:    150_000.00, glBalance:    148_700.00, variance:    1_300.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "A. Kim"      },
  { id: "BA015", account: "Customer Refunds — USD",     accountNo: "****6634", bank: "Wells Fargo",     currency: "USD", bankBalance:  2_340_800.00, glBalance:  2_340_800.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "R. Thompson" },
];

// ── Default adjustments (pre-seeded example data) ─────────────────────────────

const DEFAULT_ADJUSTMENTS: AdjustmentRow[] = [
  {
    id: "adj-001",
    type: "add",
    attributeName: "Bank Charges",
    amount: 1_250.00,
    description: "Monthly service charge per JPMorgan Chase statement — Mar 2026",
    createdAt: "2026-03-13T08:00:00Z",
    createdBy: "J. Carter",
  },
  {
    id: "adj-002",
    type: "subtract",
    attributeName: "NSF / Non-Sufficient Funds",
    amount: 3_400.00,
    description: "Returned check from client Acme Corp — invoice #INV-8821",
    createdAt: "2026-03-12T14:30:00Z",
    createdBy: "M. Patel",
  },
  {
    id: "adj-003",
    type: "add",
    attributeName: "Interest Earned",
    amount: 8_920.50,
    description: "Interest credited on JPMorgan Chase savings account for March",
    createdAt: "2026-03-13T07:00:00Z",
    createdBy: "J. Carter",
  },
  {
    id: "adj-004",
    type: "subtract",
    attributeName: "Service Fee",
    amount: 450.00,
    description: "Wire transfer processing fees — 3 outbound international transfers",
    createdAt: "2026-03-11T10:15:00Z",
    createdBy: "S. Nguyen",
  },
];

// ── Financial constants ───────────────────────────────────────────────────────

const BANK_OPENING_BALANCE = 165_200_000.00;

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatVariance(value: number, currency = "USD"): string {
  const formatted = formatCurrency(Math.abs(value), currency);
  if (value === 0) return "—";
  return value > 0 ? `+${formatted}` : `−${formatted}`;
}

let adjIdCounter = DEFAULT_ADJUSTMENTS.length + 1;
function nextAdjId(): string {
  return `adj-${String(adjIdCounter++).padStart(3, "0")}`;
}

// ── Alerts ─────────────────────────────────────────────────────────────────────

const alerts = [
  { id: 1, level: "critical" as const, icon: AlertCircle,   msg: "3 accounts with exceptions require immediate review — SLA breach in <4 hrs",         action: "Review Now"      },
  { id: 2, level: "warning"  as const, icon: AlertTriangle, msg: "Bank statement for HSBC GBP account pending upload since Mar 11",                     action: "Upload Statement"},
  { id: 3, level: "info"     as const, icon: Info,          msg: "Auto-reconciliation completed: 10 of 15 accounts fully reconciled as of 09:45 EST",   action: "View Report"     },
];

// ── Table columns ──────────────────────────────────────────────────────────────

const columns: Column<BankAccount>[] = [
  {
    key: "account", header: "Account", sortable: true, width: "260px",
    render: (_, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[#0f172a] whitespace-nowrap">{row.account}</span>
        <span className="text-xs text-[#94a3b8] font-mono">{row.accountNo}</span>
      </div>
    ),
  },
  {
    key: "bank", header: "Bank", sortable: true, width: "160px",
    render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
          <Building2 size={12} className="text-[#64748b]" />
        </div>
        <span className="text-sm text-[#334155] whitespace-nowrap">{String(v)}</span>
      </div>
    ),
  },
  {
    key: "bankBalance", header: "Bank Balance", sortable: true, align: "right", width: "160px",
    render: (v, row) => (
      <span className="font-mono text-sm text-[#0f172a] whitespace-nowrap">
        {formatCurrency(v as number, row.currency)}
      </span>
    ),
  },
  {
    key: "glBalance", header: "GL Balance", sortable: true, align: "right", width: "160px",
    render: (v, row) => (
      <span className="font-mono text-sm text-[#334155] whitespace-nowrap">
        {formatCurrency(v as number, row.currency)}
      </span>
    ),
  },
  {
    key: "variance", header: "Variance", sortable: true, align: "right", width: "140px",
    render: (v, row) => {
      const val = v as number;
      return (
        <span className={`font-mono text-sm font-medium whitespace-nowrap ${val === 0 ? "text-[#64748b]" : val > 0 ? "text-[#b45309]" : "text-[#b91c1c]"}`}>
          {formatVariance(val, row.currency)}
        </span>
      );
    },
  },
  {
    key: "status", header: "Status", sortable: true, align: "center", width: "130px",
    render: (v) => <StatusBadge status={v as BankAccount["status"]} size="sm" />,
  },
  {
    key: "lastReconciled", header: "Last Reconciled", sortable: true, width: "145px",
    render: (v) => <span className="text-xs text-[#64748b] whitespace-nowrap">{String(v)}</span>,
  },
  {
    key: "analyst", header: "Analyst", sortable: true, width: "110px",
    render: (v) => {
      const initials = String(v).split(" ").map((p) => p[0]).join("");
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-[#1d4ed8]">{initials}</span>
          </div>
          <span className="text-xs text-[#64748b]">{String(v)}</span>
        </div>
      );
    },
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export function ReconciliationDashboard() {
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [adjustments, setAdjustments]   = useState<AdjustmentRow[]>(DEFAULT_ADJUSTMENTS);

  // ── Derived financials ────────────────────────────────────────────────────

  const bankClosingBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + a.bankBalance, 0),
    []
  );
  const glBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + a.glBalance, 0),
    []
  );
  const totalAdditions = useMemo(
    () => adjustments.filter((a) => a.type === "add").reduce((s, a) => s + a.amount, 0),
    [adjustments]
  );
  const totalSubtractions = useMemo(
    () => adjustments.filter((a) => a.type === "subtract").reduce((s, a) => s + a.amount, 0),
    [adjustments]
  );
  const netAdjustments     = totalAdditions - totalSubtractions;
  const adjustedBankBalance = bankClosingBalance + netAdjustments;
  const finalVariance       = adjustedBankBalance - glBalance;

  const reconStatus: "reconciled" | "exception" | "in-progress" | "pending" =
    finalVariance === 0
      ? "reconciled"
      : Math.abs(finalVariance) <= 500
      ? "in-progress"
      : "exception";

  const reconStatusLabel =
    reconStatus === "reconciled"
      ? "Fully Reconciled"
      : reconStatus === "in-progress"
      ? "Minor Variance"
      : "Variance Detected";

  // ── KPI derivations ───────────────────────────────────────────────────────

  const totalAccounts   = bankAccounts.length;
  const reconciledCount = bankAccounts.filter((a) => a.status === "reconciled").length;
  const openExceptions  = bankAccounts.filter((a) => a.status === "exception").length;
  const inProgressCount = bankAccounts.filter((a) => a.status === "in-progress").length;

  // ── Table filtering / pagination ──────────────────────────────────────────

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return bankAccounts.filter((r) => {
      const matchesSearch =
        !q ||
        r.account.toLowerCase().includes(q) ||
        r.bank.toLowerCase().includes(q) ||
        r.accountNo.includes(q) ||
        r.currency.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalItems  = filteredData.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedData   = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // ── Adjustment handlers ───────────────────────────────────────────────────

  const handleAddAdjustment = (row: NewAdjustmentRow) => {
    setAdjustments((prev) => [
      ...prev,
      {
        ...row,
        id: nextAdjId(),
        createdAt: new Date().toISOString(),
        createdBy: "J. Wilson",
      },
    ]);
  };

  const handleEditAdjustment = (row: AdjustmentRow) => {
    setAdjustments((prev) => prev.map((a) => (a.id === row.id ? row : a)));
  };

  const handleDeleteAdjustment = (id: string) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[#0f172a]">Reconciliation Dashboard</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Period:{" "}
            <span className="font-medium text-[#334155]">March 1 – March 13, 2026</span>
            &nbsp;·&nbsp; Fiscal Year Q1 2026 &nbsp;·&nbsp;
            <span className="text-[#94a3b8]">Last updated: Today, 09:45 EST</span>
          </p>
        </div>
        {/* <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Printer size={13} /> Print
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <FileCheck2 size={13} /> Certify
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm">
            <RefreshCw size={13} /> Run Reconciliation
          </button>
        </div> */}
      </div>

      {/* ── Alert Banners ────────────────────────────────────────────────────── */}
      {/* <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm ${
                alert.level === "critical"
                  ? "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
                  : alert.level === "warning"
                  ? "bg-[#fffbeb] border-[#fde68a] text-[#92400e]"
                  : "bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={14} className="flex-shrink-0" />
                <span className="truncate">{alert.msg}</span>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold hover:underline flex-shrink-0 ml-4 whitespace-nowrap">
                {alert.action} <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div> */}

      {/* ── Balance KPI Cards (6 up) ─────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
          Balance Summary — March 2026
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. Bank Opening Balance */}
          <BalanceSummaryCard
            label="Bank Opening Balance"
            value={BANK_OPENING_BALANCE}
            currency="USD"
            accent="blue"
            icon={<Landmark size={14} />}
            sublabel="Period start: Mar 1, 2026"
          />

          {/* 2. Bank Closing Balance */}
          <BalanceSummaryCard
            label="Bank Closing Balance"
            value={bankClosingBalance}
            currency="USD"
            accent="teal"
            icon={<Landmark size={14} />}
            sublabel="Sum of all bank accounts"
            deltaValue={bankClosingBalance - BANK_OPENING_BALANCE}
            deltaLabel="vs opening"
          />

          {/* 3. GL Balance */}
          <BalanceSummaryCard
            label="GL Balance"
            value={glBalance}
            currency="USD"
            accent="purple"
            icon={<BookOpen size={14} />}
            sublabel="General ledger as of period"
            deltaValue={glBalance - bankClosingBalance}
            deltaLabel="vs bank"
          />

          {/* 4. Total Adjustments */}
          <BalanceSummaryCard
            label="Total Adjustments"
            value={netAdjustments}
            currency="USD"
            accent={netAdjustments >= 0 ? "green" : "orange"}
            icon={<Scale size={14} />}
            sublabel={`${adjustments.length} adjustment entries`}
            isVariance
          />

          {/* 5. Net Variance */}
          <BalanceSummaryCard
            label="Net Variance"
            value={finalVariance}
            currency="USD"
            accent={finalVariance === 0 ? "green" : Math.abs(finalVariance) < 1000 ? "orange" : "red"}
            icon={<TrendingDown size={14} />}
            sublabel="Adjusted bank vs GL balance"
            isVariance
          />

          {/* 6. Reconciliation Status */}
          <BalanceSummaryCard
            label="Reconciliation Status"
            value={0}
            currency="USD"
            accent={reconStatus === "reconciled" ? "green" : reconStatus === "in-progress" ? "orange" : "red"}
            icon={<CheckCircle2 size={14} />}
            sublabel="As of Mar 13, 2026 09:45 EST"
            statusOverride={{ label: reconStatusLabel, variant: reconStatus }}
          />
        </div>
      </div>

      {/* ── Legacy KPI Cards ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
          Operational Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <KpiCard
            title="Total Accounts"
            value={String(totalAccounts)}
            subtitle="Across 12 banking institutions"
            change={4.2}
            changeLabel="vs last month"
            icon={<Building2 size={20} className="text-[#1a56db]" />}
            iconBg="bg-[#dbeafe]"
            variant="info"
            sparkline={[210, 218, 225, 229, 235, 241, totalAccounts]}
            footer="3 new accounts this month"
          />
          <KpiCard
            title="Auto-Match Rate"
            value={`${((reconciledCount / totalAccounts) * 100).toFixed(1)}%`}
            subtitle={`${reconciledCount} of ${totalAccounts} accounts reconciled`}
            change={2.1}
            changeLabel="vs last period"
            icon={<CheckCircle2 size={20} className="text-[#15803d]" />}
            iconBg="bg-[#dcfce7]"
            variant="success"
            sparkline={[61, 64, 60, 63, 65, 66, Math.round((reconciledCount / totalAccounts) * 100)]}
            footer="Target: 75%"
          />
          {/* <KpiCard
            title="Open Exceptions"
            value={String(openExceptions)}
            subtitle={`${inProgressCount} in progress · ${openExceptions} critical`}
            change={-25.0}
            changeLabel="vs yesterday"
            icon={<AlertTriangle size={20} className="text-[#b45309]" />}
            iconBg="bg-[#fef3c7]"
            variant="warning"
            sparkline={[8, 6, 9, 7, 5, 4, openExceptions]}
            footer="SLA: 24h resolution"
          /> */}
          <KpiCard
            title="Adjusted Net Variance"
            value={
              Math.abs(finalVariance) >= 1_000_000
                ? `$${(Math.abs(finalVariance) / 1_000_000).toFixed(2)}M`
                : Math.abs(finalVariance) >= 1_000
                ? `$${(Math.abs(finalVariance) / 1_000).toFixed(1)}K`
                : `$${Math.abs(finalVariance).toFixed(2)}`
            }
            subtitle={`${adjustments.length} adjustments applied`}
            change={-8.4}
            changeLabel="vs last week"
            icon={<Wallet size={20} className="text-[#7c3aed]" />}
            iconBg="bg-[#f3e8ff]"
            variant={finalVariance === 0 ? "success" : "warning"}
            sparkline={[85, 72, 91, 68, 74, 65, Math.round(Math.abs(finalVariance))]}
            footer="Post-adjustment variance"
          />
        </div>
      </div>

      {/* ── Status Summary Strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Reconciled",  count: reconciledCount, pct: ((reconciledCount / totalAccounts) * 100).toFixed(0), bar: "bg-[#22c55e]", text: "text-[#15803d]", bg: "bg-[#f0fdf4]",  border: "border-[#bbf7d0]", icon: CheckCircle2,   iconColor: "text-[#22c55e]" },
          { label: "In Progress", count: inProgressCount, pct: ((inProgressCount / totalAccounts) * 100).toFixed(0), bar: "bg-[#0ea5e9]", text: "text-[#0369a1]", bg: "bg-[#f0f9ff]",  border: "border-[#bae6fd]", icon: RefreshCw,       iconColor: "text-[#0ea5e9]" },
          { label: "Exception",   count: openExceptions,  pct: ((openExceptions  / totalAccounts) * 100).toFixed(0), bar: "bg-[#f59e0b]", text: "text-[#b45309]", bg: "bg-[#fffbeb]",  border: "border-[#fde68a]", icon: AlertTriangle,   iconColor: "text-[#f59e0b]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`${item.bg} ${item.border} border rounded-xl p-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} className={item.iconColor} />
                  <span className="text-sm font-medium text-[#334155]">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.text}`}>{item.count}</span>
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.bar} transition-all duration-500`} style={{ width: `${item.pct}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#94a3b8]">{item.pct}% of total</span>
                <span className="text-xs text-[#94a3b8]">{totalAccounts} total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Adjustment Attributes ─────────────────────────────────────────────── */}
      {/* <AdjustmentAttributesTable
        adjustments={adjustments}
        onAdd={handleAddAdjustment}
        onEdit={handleEditAdjustment}
        onDelete={handleDeleteAdjustment}
        currency="USD"
      /> */}

      {/* ── Reconciliation Summary Panel ─────────────────────────────────────── */}
      {/* <ReconciliationSummaryPanel
        openingBalance={BANK_OPENING_BALANCE}
        totalAdditions={totalAdditions}
        totalSubtractions={totalSubtractions}
        adjustedBankBalance={adjustedBankBalance}
        glBalance={glBalance}
        currency="USD"
        periodLabel="March 2026"
        asOfDate="March 13, 2026"
      /> */}

      {/* ── Bank Accounts Table ───────────────────────────────────────────────── */}
      <div>
        {/* Table header */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[#0f172a]">Bank Accounts — Reconciliation Status</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              {totalAccounts} accounts monitored &nbsp;·&nbsp; As of March 13, 2026
            </p>
          </div>
          <div className="relative flex-shrink-0 w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search account or bank…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 placeholder:text-[#94a3b8] text-[#334155] transition-all"
            />
          </div>
        </div> */}

        {/* Quick filter badges */}
        {/* <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[#94a3b8] mr-1">Filter:</span>
          {(["", "reconciled", "in-progress", "exception"] as const).map((f) => {
            const labels: Record<string, string> = { "": "All", "reconciled": "Reconciled", "in-progress": "In Progress", "exception": "Exception" };
            const isActive = statusFilter === f;
            const count = f === "" ? bankAccounts.length : bankAccounts.filter((a) => a.status === f).length;
            return (
              <button
                key={f || "all"}
                onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  isActive
                    ? "bg-[#1a56db] border-[#1a56db] text-white"
                    : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#1a56db] hover:text-[#1a56db]"
                }`}
              >
                {labels[f]}
                {f !== "" && <span className="ml-1.5 opacity-70">{count}</span>}
              </button>
            );
          })}

          {filteredData.length !== bankAccounts.length && (
            <span className="text-xs text-[#64748b] ml-auto">
              Showing <span className="font-medium text-[#334155]">{filteredData.length}</span> results
            </span>
          )}
        </div> */}

        {/* <DataTable<BankAccount>
          columns={columns}
          data={pagedData}
          keyField="id"
          emptyMessage="No accounts match your search criteria."
          rowActions={[
            { label: "View Details",       action: "view"      },
            { label: "Reconcile Manually", action: "reconcile" },
            { label: "Upload Statement",   action: "upload"    },
            // { label: "Escalate Exception", action: "escalate", danger: true },
          ]}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            pageSize,
            onPageChange: (p) => setCurrentPage(p),
            onPageSizeChange: (s) => { setPageSize(s); setCurrentPage(1); },
          }}
        /> */}
      </div>
    </div>
  );
}
