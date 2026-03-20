import { useState, useMemo } from "react";
import { Search, Building2 } from "lucide-react";
import { DataTable, Column } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";

// ✅ Reuse same type
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
  { id: "BA002", account: "Payroll — USD",              accountNo: "****2290", bank: "Bank of America", currency: "USD", bankBalance: 12_874_100.50, glBalance: 12_891_340.50, variance:  -17_240.00, status: "exception",   lastReconciled: "Mar 12, 2026", analyst: "M. Patel"    },
  { id: "BA003", account: "Collections — USD",          accountNo: "****7731", bank: "Citibank",        currency: "USD", bankBalance:  9_450_000.00, glBalance:  9_450_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA004", account: "Treasury — USD Reserve",     accountNo: "****5503", bank: "Wells Fargo",     currency: "USD", bankBalance: 25_100_000.00, glBalance: 25_100_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "J. Carter"   },
  { id: "BA005", account: "Disbursements — USD",        accountNo: "****8847", bank: "HSBC",            currency: "USD", bankBalance:  6_220_780.25, glBalance:  6_198_450.00, variance:   22_330.25, status: "exception",   lastReconciled: "Mar 11, 2026", analyst: "R. Thompson" },
  { id: "BA006", account: "Intercompany — USD",         accountNo: "****1192", bank: "Goldman Sachs",   currency: "USD", bankBalance:  4_500_000.00, glBalance:  4_498_150.00, variance:    1_850.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "A. Kim"      },
  { id: "BA007", account: "Tax Escrow — USD",           accountNo: "****3374", bank: "JPMorgan Chase",  currency: "USD", bankBalance:  3_812_900.00, glBalance:  3_812_900.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "M. Patel"    },
  { id: "BA008", account: "Investments — USD",          accountNo: "****6690", bank: "Morgan Stanley",  currency: "USD", bankBalance: 18_750_000.00, glBalance: 18_750_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA009", account: "Vendor Payments — USD",      accountNo: "****0928", bank: "UBS",             currency: "USD", bankBalance:  2_140_500.00, glBalance:  2_155_000.00, variance:  -14_500.00, status: "exception",   lastReconciled: "Mar 10, 2026", analyst: "R. Thompson" },
  { id: "BA010", account: "Revenue — USD",              accountNo: "****4417", bank: "TD Bank",         currency: "USD", bankBalance:  7_630_200.00, glBalance:  7_630_200.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "A. Kim"      },
  { id: "BA011", account: "Capex — USD",                accountNo: "****7755", bank: "Citibank",        currency: "USD", bankBalance: 11_200_000.00, glBalance: 11_194_800.00, variance:    5_200.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "J. Carter"   },
  { id: "BA012", account: "Operating — USD",            accountNo: "****3308", bank: "DBS Bank",        currency: "USD", bankBalance:  4_985_600.00, glBalance:  4_985_600.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "M. Patel"    },
  { id: "BA013", account: "Hedging — USD",              accountNo: "****2261", bank: "Deutsche Bank",   currency: "USD", bankBalance:  8_900_000.00, glBalance:  8_900_000.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "S. Nguyen"   },
  { id: "BA014", account: "Petty Cash — USD",           accountNo: "****9912", bank: "Bank of America", currency: "USD", bankBalance:    150_000.00, glBalance:    148_700.00, variance:    1_300.00, status: "in-progress", lastReconciled: "Mar 12, 2026", analyst: "A. Kim"      },
  { id: "BA015", account: "Customer Refunds — USD",     accountNo: "****6634", bank: "Wells Fargo",     currency: "USD", bankBalance:  2_340_800.00, glBalance:  2_340_800.00, variance:        0,    status: "reconciled",  lastReconciled: "Mar 13, 2026", analyst: "R. Thompson" },
];

// ✅ Move columns here OR share globally
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


export function ReconciliationStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  return (
    <div className="p-6 space-y-6 min-h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-[#0f172a]">Bank Accounts — Reconciliation Status</h2>
                {/* <p className="text-xs text-[#64748b] mt-0.5">
                  {totalAccounts} accounts monitored &nbsp;·&nbsp; As of March 13, 2026
                </p> */}
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
            </div>
    
            {/* Quick filter badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
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
            </div>
    
            <DataTable<BankAccount>
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
            />
    </div>
        
  );
}