import { useState } from "react";
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  Share2,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Table2,
  BookOpen,
  ShieldCheck,
  ArrowLeftRight,
  Globe,
  ScanLine,
  Building2,
  Zap,
  ChevronDown,
  Play,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────

type Frequency = "Daily" | "Weekly" | "Monthly" | "On-Demand";
type FileFormat = "PDF" | "XLSX" | "CSV";
type GenerateState = "idle" | "generating" | "done";

// ── Report Catalogue ──────────────────────────────────────────────────────────

const REPORT_CATALOGUE = [
  {
    id: "recon-summary",
    name: "Reconciliation Summary",
    desc: "Full reconciliation status across all bank accounts, matched/unmatched counts and net exposure.",
    frequency: "Daily" as Frequency,
    icon: BarChart3,
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1d4ed8]",
    accentBorder: "border-t-[#3b82f6]",
    formats: ["PDF", "XLSX", "CSV"] as FileFormat[],
    lastGenerated: "Today, 07:00",
    category: "Operations",
  },
  {
    id: "exception-aging",
    name: "Exception Aging Report",
    desc: "Aged analysis of open exceptions by priority tier, SLA breach risk and responsible analyst.",
    frequency: "Daily" as Frequency,
    icon: Clock,
    iconBg: "bg-[#fee2e2]",
    iconColor: "text-[#b91c1c]",
    accentBorder: "border-t-[#ef4444]",
    formats: ["XLSX", "CSV"] as FileFormat[],
    lastGenerated: "Today, 08:02",
    category: "Operations",
  },
  {
    id: "bank-to-book",
    name: "Bank-to-Book Variance",
    desc: "Side-by-side comparison of bank statement balances vs GL book values with variance drill-down.",
    frequency: "Weekly" as Frequency,
    icon: ArrowLeftRight,
    iconBg: "bg-[#fef3c7]",
    iconColor: "text-[#b45309]",
    accentBorder: "border-t-[#f59e0b]",
    formats: ["PDF", "XLSX"] as FileFormat[],
    lastGenerated: "Mar 10, 2026",
    category: "Variance",
  },
  {
    id: "period-end-cert",
    name: "Period-End Certificate",
    desc: "Signed attestation package confirming completion of period-end close procedures for SOX compliance.",
    frequency: "Monthly" as Frequency,
    icon: ShieldCheck,
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#15803d]",
    accentBorder: "border-t-[#22c55e]",
    formats: ["PDF"] as FileFormat[],
    lastGenerated: "Feb 28, 2026",
    category: "Compliance",
  },
  {
    id: "match-rate",
    name: "Match Rate Analytics",
    desc: "Trend analysis of auto-match rate, manual matches, and engine performance over the selected period.",
    frequency: "Weekly" as Frequency,
    icon: TrendingUp,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#7c3aed]",
    accentBorder: "border-t-[#a855f7]",
    formats: ["PDF", "XLSX"] as FileFormat[],
    lastGenerated: "Mar 10, 2026",
    category: "Analytics",
  },
  {
    id: "fx-recon",
    name: "FX Reconciliation",
    desc: "Multi-currency reconciliation report covering rate variances, hedging positions and translation P&L.",
    frequency: "Daily" as Frequency,
    icon: Globe,
    iconBg: "bg-[#e0f2fe]",
    iconColor: "text-[#0369a1]",
    accentBorder: "border-t-[#0ea5e9]",
    formats: ["XLSX", "CSV"] as FileFormat[],
    lastGenerated: "Today, 07:30",
    category: "FX",
  },
  {
    id: "audit-trail",
    name: "Audit Trail Report",
    desc: "Chronological log of all system actions, user approvals, journal entries and exception resolutions.",
    frequency: "On-Demand" as Frequency,
    icon: ScanLine,
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#c2410c]",
    accentBorder: "border-t-[#fb923c]",
    formats: ["PDF", "CSV"] as FileFormat[],
    lastGenerated: "Mar 12, 2026",
    category: "Compliance",
  },
  {
    id: "intercompany",
    name: "Intercompany Report",
    desc: "Consolidated view of intercompany balances, netting positions and elimination entries across entities.",
    frequency: "Monthly" as Frequency,
    icon: Building2,
    iconBg: "bg-[#f0fdf4]",
    iconColor: "text-[#166534]",
    accentBorder: "border-t-[#16a34a]",
    formats: ["PDF", "XLSX", "CSV"] as FileFormat[],
    lastGenerated: "Feb 28, 2026",
    category: "Group",
  },
];

// ── Recent Reports ─────────────────────────────────────────────────────────────

interface RecentReport {
  id: string;
  name: string;
  reportId: string;
  generatedDate: string;
  generatedBy: string;
  generatedByInitials: string;
  fileType: FileFormat;
  fileSize: string;
  status: "ready" | "processing" | "failed";
  category: string;
}

const RECENT_REPORTS: RecentReport[] = [
  { id: "1", name: "Reconciliation Summary", reportId: "recon-summary", generatedDate: "Mar 13, 2026  07:00", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "PDF", fileSize: "2.4 MB", status: "ready", category: "Operations" },
  { id: "2", name: "Reconciliation Summary", reportId: "recon-summary", generatedDate: "Mar 13, 2026  07:00", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "XLSX", fileSize: "1.1 MB", status: "ready", category: "Operations" },
  { id: "3", name: "Exception Aging Report", reportId: "exception-aging", generatedDate: "Mar 13, 2026  08:02", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "XLSX", fileSize: "880 KB", status: "ready", category: "Operations" },
  { id: "4", name: "FX Reconciliation", reportId: "fx-recon", generatedDate: "Mar 13, 2026  07:30", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "XLSX", fileSize: "1.7 MB", status: "ready", category: "FX" },
  { id: "5", name: "FX Reconciliation", reportId: "fx-recon", generatedDate: "Mar 13, 2026  07:30", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "CSV", fileSize: "340 KB", status: "ready", category: "FX" },
  { id: "6", name: "Match Rate Analytics", reportId: "match-rate", generatedDate: "Mar 12, 2026  17:14", generatedBy: "Sarah Kim", generatedByInitials: "SK", fileType: "PDF", fileSize: "3.1 MB", status: "ready", category: "Analytics" },
  { id: "7", name: "Bank-to-Book Variance", reportId: "bank-to-book", generatedDate: "Mar 12, 2026  09:00", generatedBy: "James Wilson", generatedByInitials: "JW", fileType: "XLSX", fileSize: "2.0 MB", status: "ready", category: "Variance" },
  { id: "8", name: "Audit Trail Report", reportId: "audit-trail", generatedDate: "Mar 12, 2026  08:45", generatedBy: "Rachel Chen", generatedByInitials: "RC", fileType: "PDF", fileSize: "5.6 MB", status: "ready", category: "Compliance" },
  { id: "9", name: "Audit Trail Report", reportId: "audit-trail", generatedDate: "Mar 12, 2026  08:45", generatedBy: "Rachel Chen", generatedByInitials: "RC", fileType: "CSV", fileSize: "1.2 MB", status: "ready", category: "Compliance" },
  { id: "10", name: "Reconciliation Summary", reportId: "recon-summary", generatedDate: "Mar 12, 2026  07:00", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "PDF", fileSize: "2.3 MB", status: "ready", category: "Operations" },
  { id: "11", name: "Exception Aging Report", reportId: "exception-aging", generatedDate: "Mar 12, 2026  08:00", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "CSV", fileSize: "420 KB", status: "ready", category: "Operations" },
  { id: "12", name: "Bank-to-Book Variance", reportId: "bank-to-book", generatedDate: "Mar 10, 2026  09:00", generatedBy: "Scheduled", generatedByInitials: "SC", fileType: "PDF", fileSize: "1.9 MB", status: "ready", category: "Variance" },
  { id: "13", name: "Period-End Certificate", reportId: "period-end-cert", generatedDate: "Feb 28, 2026  18:00", generatedBy: "Michael Torres", generatedByInitials: "MT", fileType: "PDF", fileSize: "4.8 MB", status: "ready", category: "Compliance" },
  { id: "14", name: "Intercompany Report", reportId: "intercompany", generatedDate: "Feb 28, 2026  17:30", generatedBy: "Priya Patel", generatedByInitials: "PP", fileType: "XLSX", fileSize: "3.4 MB", status: "ready", category: "Group" },
  { id: "15", name: "Intercompany Report", reportId: "intercompany", generatedDate: "Feb 28, 2026  17:30", generatedBy: "Priya Patel", generatedByInitials: "PP", fileType: "CSV", fileSize: "890 KB", status: "ready", category: "Group" },
];

// ── Chart data ─────────────────────────────────────────────────────────────────

const monthlyRecon = [
  { month: "Oct", matched: 41200, exceptions: 280, rate: 99.3 },
  { month: "Nov", matched: 38900, exceptions: 320, rate: 99.2 },
  { month: "Dec", matched: 44100, exceptions: 190, rate: 99.6 },
  { month: "Jan", matched: 47300, exceptions: 240, rate: 99.5 },
  { month: "Feb", matched: 43800, exceptions: 310, rate: 99.3 },
  { month: "Mar", matched: 38470, exceptions: 142, rate: 99.6 },
];

const matchRateTrend = [
  { date: "Mar 1", rate: 98.1 }, { date: "Mar 3", rate: 98.6 },
  { date: "Mar 5", rate: 97.9 }, { date: "Mar 7", rate: 99.1 },
  { date: "Mar 9", rate: 98.8 }, { date: "Mar 11", rate: 99.3 },
  { date: "Mar 13", rate: 98.4 },
];

const exceptionDist = [
  { name: "Amount Mismatch", value: 38, color: "#ef4444" },
  { name: "Missing Txn", value: 24, color: "#f59e0b" },
  { name: "Date Discrepancy", value: 18, color: "#3b82f6" },
  { name: "Duplicate Entry", value: 12, color: "#8b5cf6" },
  { name: "Currency Variance", value: 8, color: "#06b6d4" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const FREQ_STYLE: Record<Frequency, { bg: string; text: string; dot: string }> = {
  Daily:     { bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#3b82f6]" },
  Weekly:    { bg: "bg-[#e0f2fe]", text: "text-[#0369a1]", dot: "bg-[#0ea5e9]" },
  Monthly:   { bg: "bg-[#f3e8ff]", text: "text-[#7c3aed]", dot: "bg-[#a855f7]" },
  "On-Demand": { bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#94a3b8]" },
};

function FrequencyBadge({ freq }: { freq: Frequency }) {
  const s = FREQ_STYLE[freq];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {freq}
    </span>
  );
}

function FileTypeIcon({ type, size = "md" }: { type: FileFormat; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-7" : "w-8 h-9";
  const textSize = size === "sm" ? "text-[8px]" : "text-[9px]";
  const configs: Record<FileFormat, { bg: string; stripe: string; label: string; icon: typeof FileText }> = {
    PDF:  { bg: "bg-[#fee2e2]", stripe: "bg-[#ef4444]", label: "PDF", icon: FileText },
    XLSX: { bg: "bg-[#dcfce7]", stripe: "bg-[#22c55e]", label: "XLS", icon: FileSpreadsheet },
    CSV:  { bg: "bg-[#dbeafe]", stripe: "bg-[#3b82f6]", label: "CSV", icon: Table2 },
  };
  const cfg = configs[type];
  const Icon = cfg.icon;
  return (
    <div className={`${dim} ${cfg.bg} rounded-md flex flex-col overflow-hidden relative border border-white/60 shadow-sm`}>
      <div className={`h-1 w-full ${cfg.stripe}`} />
      <div className="flex-1 flex items-center justify-center">
        <Icon size={size === "sm" ? 10 : 13} className={`${type === "PDF" ? "text-[#b91c1c]" : type === "XLSX" ? "text-[#15803d]" : "text-[#1d4ed8]"}`} />
      </div>
      <div className={`${cfg.stripe} ${textSize} font-bold text-white text-center py-0.5`}>{cfg.label}</div>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    Operations: "bg-[#dbeafe] text-[#1d4ed8]",
    Variance:   "bg-[#fef3c7] text-[#b45309]",
    Compliance: "bg-[#dcfce7] text-[#15803d]",
    Analytics:  "bg-[#f3e8ff] text-[#7c3aed]",
    FX:         "bg-[#e0f2fe] text-[#0369a1]",
    Group:      "bg-[#f0fdf4] text-[#166534]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[cat] || "bg-[#f1f5f9] text-[#64748b]"}`}>
      {cat}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type ChartTab = "volume" | "rate" | "exceptions";

export function ReportsAnalytics() {
  const [generateStates, setGenerateStates] = useState<Record<string, GenerateState>>({});
  const [chartTab, setChartTab] = useState<ChartTab>("volume");
  const [searchRecent, setSearchRecent] = useState("");
  const [filterType, setFilterType] = useState<"" | FileFormat | "all">("");
  const [filterCategory, setFilterCategory] = useState("");

  const handleGenerate = (id: string) => {
    setGenerateStates((p) => ({ ...p, [id]: "generating" }));
    setTimeout(() => {
      setGenerateStates((p) => ({ ...p, [id]: "done" }));
      setTimeout(() => setGenerateStates((p) => ({ ...p, [id]: "idle" })), 3000);
    }, 2000);
  };

  const filteredRecent = RECENT_REPORTS.filter((r) => {
    if (searchRecent && !r.name.toLowerCase().includes(searchRecent.toLowerCase()) && !r.generatedBy.toLowerCase().includes(searchRecent.toLowerCase())) return false;
    if (filterType && r.fileType !== filterType) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    return true;
  });

  const statsToday = RECENT_REPORTS.filter((r) => r.generatedDate.startsWith("Mar 13")).length;
  const scheduled = REPORT_CATALOGUE.filter((r) => r.frequency !== "On-Demand").length;

  const chartTabs: { id: ChartTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "volume", label: "Reconciliation Volume", icon: BarChart3 },
    { id: "rate", label: "Match Rate Trend", icon: TrendingUp },
    { id: "exceptions", label: "Exception Distribution", icon: Filter },
  ];

  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[#0f172a]">Reports & Analytics</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Operational reporting, scheduled exports and performance analytics &nbsp;·&nbsp;
            <span className="text-[#94a3b8]">Period: Q1 2026</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Share2 size={14} /> Share
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all shadow-sm">
            <Calendar size={14} /> Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm">
            <Plus size={14} /> New Report
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Generated Today", value: statsToday, icon: FileText, iconBg: "bg-[#dbeafe]", iconColor: "text-[#1d4ed8]", sub: "Across all report types", border: "border-[#bfdbfe]" },
          { label: "Scheduled Reports", value: scheduled, icon: Calendar, iconBg: "bg-[#dcfce7]", iconColor: "text-[#15803d]", sub: "Running on auto-schedule", border: "border-[#bbf7d0]" },
          { label: "Available Reports", value: REPORT_CATALOGUE.length, icon: BookOpen, iconBg: "bg-[#f3e8ff]", iconColor: "text-[#7c3aed]", sub: "In the report catalogue", border: "border-[#e9d5ff]" },
          { label: "On-Demand Reports", value: REPORT_CATALOGUE.filter((r) => r.frequency === "On-Demand").length, icon: Zap, iconBg: "bg-[#fef3c7]", iconColor: "text-[#b45309]", sub: "Available to generate now", border: "border-[#fde68a]" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${s.border} shadow-sm p-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={s.iconColor} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0f172a] tracking-tight">{s.value}</div>
                <div className="text-xs font-semibold text-[#64748b] mt-0.5">{s.label}</div>
                <div className="text-[10px] text-[#94a3b8]">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Available Reports Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#0f172a]">Available Reports</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Click "Generate" on any report to create a fresh output</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" />Daily</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />Weekly</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" />Monthly</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#94a3b8]" />On-Demand</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {REPORT_CATALOGUE.map((report) => {
            const Icon = report.icon;
            const state = generateStates[report.id] || "idle";
            return (
              <div
                key={report.id}
                className={`bg-white rounded-xl border border-[#e2e8f0] border-t-4 ${report.accentBorder} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}
              >
                {/* Card header */}
                <div className="px-4 pt-4 pb-3 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 ${report.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={report.iconColor} />
                    </div>
                    <FrequencyBadge freq={report.frequency} />
                  </div>

                  <h3 className="text-sm font-bold text-[#0f172a] leading-snug mb-1">{report.name}</h3>
                  <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">{report.desc}</p>

                  {/* Formats + last run */}
                  <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {report.formats.map((fmt) => (
                        <FileTypeIcon key={fmt} type={fmt} size="sm" />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Last run</div>
                      <div className="text-[11px] font-medium text-[#64748b] whitespace-nowrap">{report.lastGenerated}</div>
                    </div>
                  </div>
                </div>

                {/* Card footer – Generate button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleGenerate(report.id)}
                    disabled={state === "generating"}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 font-semibold ${
                      state === "done"
                        ? "bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]"
                        : state === "generating"
                        ? "bg-[#eff6ff] text-[#1a56db] border border-[#bfdbfe] cursor-wait"
                        : "bg-[#1a56db] text-white hover:bg-[#1d4ed8] shadow-sm"
                    }`}
                  >
                    {state === "done" ? (
                      <><CheckCircle2 size={14} /> Generated!</>
                    ) : state === "generating" ? (
                      <><RefreshCw size={14} className="animate-spin" /> Generating…</>
                    ) : (
                      <><Play size={13} fill="currentColor" /> Generate Report</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Analytics Charts ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-[#e2e8f0] px-5 bg-[#fafbfc]">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setChartTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-all -mb-px whitespace-nowrap ${
                chartTab === tab.id
                  ? "border-[#1a56db] text-[#1a56db] font-semibold"
                  : "border-transparent text-[#64748b] hover:text-[#334155]"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 py-2">
            <div className="relative">
              <select className="appearance-none text-xs pl-3 pr-8 py-1.5 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#334155] outline-none cursor-pointer">
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>This quarter</option>
                <option>YTD</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#e2e8f0] rounded-lg text-[#64748b] hover:border-[#1a56db] hover:text-[#1a56db] bg-[#f8fafc] transition-all">
              <Download size={11} /> Export
            </button>
          </div>
        </div>

        <div className="p-6">
          {chartTab === "volume" && (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[#0f172a]">Monthly Reconciliation Volume</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Matched transactions and exception count — Oct 2025 to Mar 2026</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  {[{ color: "#3b82f6", label: "Matched Txns" }, { color: "#fca5a5", label: "Exceptions" }].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                      <span className="text-[#64748b]">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={monthlyRecon} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} domain={[0, 500]} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Bar yAxisId="left" dataKey="matched" name="Matched Txns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="exceptions" name="Exceptions" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }} />
                </ComposedChart>
              </ResponsiveContainer>
              {/* Mini KPI strip */}
              <div className="mt-4 pt-4 border-t border-[#f1f5f9] grid grid-cols-3 gap-4">
                {[
                  { label: "Avg Monthly Matched", value: "42,295", color: "text-[#1d4ed8]" },
                  { label: "Avg Exceptions", value: "247", color: "text-[#b45309]" },
                  { label: "Current Match Rate", value: "99.6%", color: "text-[#15803d]" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-[#94a3b8]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {chartTab === "rate" && (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[#0f172a]">Daily Match Rate — March 2026</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Target: 99.0% &nbsp;·&nbsp; Current SLA threshold shown as dashed line</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-[#1a56db] rounded" /><span className="text-[#64748b]">Match Rate</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-[#ef4444] border-t-2 border-dashed border-[#ef4444] rounded" /><span className="text-[#64748b]">SLA Target</span></div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={matchRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[97, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="%" width={45} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v) => [`${v}%`, "Match Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#1a56db" strokeWidth={2.5} dot={{ r: 4, fill: "#1a56db", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="Match Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartTab === "exceptions" && (
            <div>
              <div className="mb-5">
                <h3 className="text-[#0f172a]">Exception Type Distribution — Q1 2026</h3>
                <p className="text-xs text-[#64748b] mt-0.5">Breakdown of exception categories across all accounts</p>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={exceptionDist} cx="50%" cy="50%" innerRadius={68} outerRadius={108} paddingAngle={3} dataKey="value">
                        {exceptionDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-2">
                  {exceptionDist.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-[#334155] flex-1">{item.name}</span>
                      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="text-sm font-bold text-[#334155] w-10 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Reports Table ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[#0f172a]">Recent Reports</h2>
            <p className="text-xs text-[#64748b] mt-0.5">{RECENT_REPORTS.length} reports generated — click any row to download</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              <input
                type="text"
                value={searchRecent}
                onChange={(e) => setSearchRecent(e.target.value)}
                placeholder="Search reports…"
                className="pl-8 pr-3 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 text-[#334155] placeholder:text-[#cbd5e1] transition-all shadow-sm w-44"
              />
            </div>
            {/* File type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#334155] outline-none focus:border-[#1a56db] cursor-pointer shadow-sm"
              >
                <option value="">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="XLSX">XLSX</option>
                <option value="CSV">CSV</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
            {/* Category filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#334155] outline-none focus:border-[#1a56db] cursor-pointer shadow-sm"
              >
                <option value="">All Categories</option>
                {["Operations", "Variance", "Compliance", "Analytics", "FX", "Group"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                {[
                  { label: "Report Name", w: "auto" },
                  { label: "Category", w: "110px" },
                  { label: "Generated Date", w: "170px" },
                  { label: "Generated By", w: "155px" },
                  { label: "File Type", w: "110px" },
                  { label: "Size", w: "80px" },
                  { label: "Download", w: "100px" },
                ].map((h) => (
                  <th
                    key={h.label}
                    style={{ width: h.w }}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#94a3b8] text-sm">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                filteredRecent.map((report, i) => {
                  const catalogItem = REPORT_CATALOGUE.find((r) => r.id === report.reportId);
                  const ReportIcon = catalogItem?.icon ?? FileText;
                  const isLast = i === filteredRecent.length - 1;
                  return (
                    <tr
                      key={report.id}
                      className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors cursor-pointer ${isLast ? "border-b-0" : ""}`}
                    >
                      {/* Report Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${catalogItem?.iconBg ?? "bg-[#f1f5f9]"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <ReportIcon size={14} className={catalogItem?.iconColor ?? "text-[#64748b]"} />
                          </div>
                          <span className="text-sm font-semibold text-[#0f172a]">{report.name}</span>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <CategoryBadge cat={report.category} />
                      </td>
                      {/* Generated Date */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#475569] tabular-nums whitespace-nowrap">{report.generatedDate}</span>
                      </td>
                      {/* Generated By */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            report.generatedBy === "Scheduled"
                              ? "bg-[#e0f2fe] text-[#0369a1]"
                              : "bg-[#dbeafe] text-[#1d4ed8]"
                          }`}>
                            {report.generatedBy === "Scheduled" ? <Calendar size={10} /> : report.generatedByInitials}
                          </div>
                          <span className="text-sm text-[#334155]">{report.generatedBy}</span>
                        </div>
                      </td>
                      {/* File Type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileTypeIcon type={report.fileType} size="sm" />
                          <span className={`text-xs font-bold ${
                            report.fileType === "PDF" ? "text-[#b91c1c]" :
                            report.fileType === "XLSX" ? "text-[#15803d]" : "text-[#1d4ed8]"
                          }`}>
                            {report.fileType}
                          </span>
                        </div>
                      </td>
                      {/* Size */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#94a3b8] tabular-nums">{report.fileSize}</span>
                      </td>
                      {/* Download */}
                      <td className="px-4 py-3">
                        <button className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          report.fileType === "PDF"
                            ? "bg-[#fff1f1] border-[#fecaca] text-[#b91c1c] hover:bg-[#fee2e2]"
                            : report.fileType === "XLSX"
                            ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d] hover:bg-[#dcfce7]"
                            : "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe]"
                        }`}>
                          <Download size={12} /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#f1f5f9] bg-[#fafbfc]">
            <span className="text-sm text-[#64748b]">
              Showing <span className="font-semibold text-[#334155]">{filteredRecent.length}</span> of{" "}
              <span className="font-semibold text-[#334155]">{RECENT_REPORTS.length}</span> reports
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#94a3b8]">
                Total size:{" "}
                <span className="font-semibold text-[#64748b]">
                  {(RECENT_REPORTS.reduce((s, r) => {
                    const n = parseFloat(r.fileSize);
                    const u = r.fileSize.includes("MB") ? 1 : 0.001;
                    return s + n * u;
                  }, 0)).toFixed(1)} MB
                </span>
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#1a56db] hover:text-[#1a56db] transition-all">
                <Download size={12} /> Download All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}