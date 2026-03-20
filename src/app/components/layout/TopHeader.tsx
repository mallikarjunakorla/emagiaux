import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Globe,
  CreditCard,
  User,
  LogOut,
  Settings,
  Shield,
  RefreshCw,
  Clock,
} from "lucide-react";

const bankAccounts = [
  { id: "all", label: "All Accounts", count: 12 },
  { id: "jpmc-001", label: "JPMorgan Chase – USD Operating", count: null },
  { id: "bofa-002", label: "Bank of America – EUR Payroll", count: null },
  { id: "citi-003", label: "Citibank – GBP Treasury", count: null },
  { id: "wells-004", label: "Wells Fargo – USD Reserve", count: null },
];

const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "SGD"];

const notifications = [
  { id: 1, type: "error", title: "14 unmatched transactions", subtitle: "Requires immediate review", time: "2m ago" },
  { id: 2, type: "warning", title: "Period-end close approaching", subtitle: "March 31 deadline in 18 days", time: "1h ago" },
  { id: 3, type: "success", title: "Auto-match completed", subtitle: "2,847 transactions reconciled", time: "3h ago" },
  { id: 4, type: "info", title: "New bank statement loaded", subtitle: "JPMorgan Chase – 1,203 items", time: "5h ago" },
];

export function TopHeader() {
  const [bankOpen, setBankOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(bankAccounts[0]);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [searchValue, setSearchValue] = useState("");

  const closeAll = () => {
    setBankOpen(false);
    setCurrencyOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#e5e9f0] flex items-center gap-3 px-5 z-40 relative shadow-sm">
      {/* Page context breadcrumb */}
      <div className="flex items-center gap-2 mr-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
          <Clock size={12} />
          <span>Last sync: <span className="text-[#0b1426] font-medium">2 min ago</span></span>
        </div>
        <div className="w-px h-4 bg-[#e2e8f0]" />
        <button className="flex items-center gap-1 text-xs text-[#1a56db] hover:text-[#1d4ed8] transition-colors">
          <RefreshCw size={11} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-[420px]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search transactions, accounts, references..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg outline-none focus:border-[#1a56db] focus:bg-white transition-all placeholder:text-[#94a3b8] text-[#0f172a]"
          />
          {searchValue && (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8] bg-[#f1f5f9] border border-[#e2e8f0] rounded px-1.5 py-0.5">
              ESC
            </kbd>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* Bank Account Selector */}
      <div className="relative">
        <button
          onClick={() => { closeAll(); setBankOpen(!bankOpen); }}
          className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#334155] hover:border-[#1a56db] hover:bg-white transition-all"
        >
          <CreditCard size={14} className="text-[#1a56db]" />
          <span className="max-w-[160px] truncate">{selectedBank.label}</span>
          {selectedBank.count && (
            <span className="bg-[#dbeafe] text-[#1d4ed8] text-xs px-1.5 py-0.5 rounded-full font-medium">
              {selectedBank.count}
            </span>
          )}
          <ChevronDown size={13} className={`text-[#64748b] transition-transform ${bankOpen ? "rotate-180" : ""}`} />
        </button>
        {bankOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setBankOpen(false)} />
            <div className="absolute top-full right-0 mt-1.5 w-72 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <div className="px-3 py-2 border-b border-[#f1f5f9]">
                <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Select Bank Account</span>
              </div>
              {bankAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => { setSelectedBank(acc); setBankOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-[#f8fafc] transition-colors text-left ${
                    selectedBank.id === acc.id ? "text-[#1a56db] bg-[#eff6ff]" : "text-[#334155]"
                  }`}
                >
                  <span>{acc.label}</span>
                  {acc.count && (
                    <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full">{acc.count} accounts</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Currency Selector */}
      {/* <div className="relative">
        <button
          onClick={() => { closeAll(); setCurrencyOpen(!currencyOpen); }}
          className="flex items-center gap-2 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#334155] hover:border-[#1a56db] hover:bg-white transition-all"
        >
          <Globe size={14} className="text-[#1a56db]" />
          <span className="font-medium">{selectedCurrency}</span>
          <ChevronDown size={13} className={`text-[#64748b] transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
        </button>
        {currencyOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
            <div className="absolute top-full right-0 mt-1.5 w-36 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 py-1">
              {currencies.map((cur) => (
                <button
                  key={cur}
                  onClick={() => { setSelectedCurrency(cur); setCurrencyOpen(false); }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-[#f8fafc] transition-colors flex items-center justify-between ${
                    selectedCurrency === cur ? "text-[#1a56db] font-medium" : "text-[#334155]"
                  }`}
                >
                  {cur}
                  {selectedCurrency === cur && <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db]" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div> */}

      {/* Notification Bell */}
      {/* <div className="relative">
        <button
          onClick={() => { closeAll(); setNotifOpen(!notifOpen); }}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#334155] transition-all"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white" />
        </button>
        {notifOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
            <div className="absolute top-full right-0 mt-1.5 w-80 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0f172a]">Notifications</span>
                <span className="text-xs text-[#1a56db] cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="divide-y divide-[#f1f5f9] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-[#f8fafc] cursor-pointer transition-colors">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                        n.type === "error" ? "bg-[#ef4444]" :
                        n.type === "warning" ? "bg-[#f59e0b]" :
                        n.type === "success" ? "bg-[#10b981]" : "bg-[#3b82f6]"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#0f172a]">{n.title}</div>
                        <div className="text-xs text-[#64748b] mt-0.5">{n.subtitle}</div>
                      </div>
                      <span className="text-xs text-[#94a3b8] flex-shrink-0">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#f1f5f9] text-center">
                <button className="text-xs text-[#1a56db] hover:underline">View all notifications</button>
              </div>
            </div>
          </>
        )}
      </div> */}

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => { closeAll(); setProfileOpen(!profileOpen); }}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#f1f5f9] transition-all"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#1a56db] to-[#7c3aed] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
            JW
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-[#0f172a] leading-tight">James Wilson</div>
            <div className="text-xs text-[#64748b] leading-tight">Treasury Manager</div>
          </div>
          <ChevronDown size={13} className={`text-[#64748b] transition-transform hidden md:block ${profileOpen ? "rotate-180" : ""}`} />
        </button>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f1f5f9]">
                <div className="text-sm font-medium text-[#0f172a]">James Wilson</div>
                <div className="text-xs text-[#64748b]">j.wilson@apexholdings.com</div>
              </div>
              {[
                { icon: User, label: "My Profile" },
                { icon: Settings, label: "Preferences" },
                { icon: Shield, label: "Security & Access" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#334155] hover:bg-[#f8fafc] transition-colors text-left"
                >
                  <item.icon size={14} className="text-[#64748b]" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-[#f1f5f9] mt-1 pt-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ef4444] hover:bg-[#fef2f2] transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
