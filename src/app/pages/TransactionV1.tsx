import { useState } from "react";
import { CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Scale,
 }from "lucide-react";

type Txn = {
  id: string;
  title: string;
  date: string;
  ref: string;
  amount: number;
  selected?: boolean;
  matched?: boolean;
};

const myStyle: React.CSSProperties = {
  color: "red",
  fontSize: "1.25rem",
  fontFamily: "JetBrains Mono, Fira Code, ui-monospace, monospace",
  fontVariantNumeric: "tabular-nums",
};

const INTERNAL_DATA: Txn[] = [
  { id: "1", title: "Stripe Payout #4821", date: "Mar 01, 2026", ref: "SP-4821", amount: 14500 },
  { id: "2", title: "AWS Infrastructure", date: "Mar 02, 2026", ref: "INV-7832", amount: -4210.5 },
  { id: "3", title: "Client Invoice #1092", date: "Mar 03, 2026", ref: "INV-1092", amount: 8750 },
  { id: "4", title: "Office Rent - Oct", date: "Mar 05, 2026", ref: "RENT-10", amount: -6200 },
  { id: "5", title: "Shopify Sales Payout", date: "Mar 07, 2026", ref: "SH-9921", amount: 3420.75 },
  { id: "6", title: "Google Workspace", date: "Mar 08, 2026", ref: "GWS-10", amount: -432 },
  { id: "7", title: "Contractor Payment - J. Smith", date: "Mar 09, 2026", ref: "PAY-JS-10", amount: -2800 },
  { id: "8", title: "Software License - Figma", date: "Mar 12, 2026", ref: "FIG-Q4", amount: -675 },
  { id: "9", title: "Payroll - September", date: "Mar 13, 2026", ref: "PR-SEP", amount: -28500 },
];

const BANK_DATA: Txn[] = [
  { id: "1", title: "STRIPE TRANSFER 14500", date: "Mar 01, 2026", ref: "REF-99201", amount: 14500 },
  { id: "2", title: "AMAZON WEB SERVICES", date: "Mar 02, 2026", ref: "AWS-10022", amount: -4210.55 },
  { id: "3", title: "WIRE TRANSFER - ACME CORP", date: "Mar 03, 2026", ref: "WT-88102", amount: 8750 },
  { id: "4", title: "SILVERSTONE PROPERTIES LLC", date: "Mar 05, 2026", ref: "DD-44210", amount: -6200 },
  { id: "5", title: "SHOPIFY INC PAYOUT", date: "Mar 07, 2026", ref: "SHP-0108", amount: 3420.75 },
  { id: "6", title: "GOOGLE *WORKSPACE", date: "Mar 08, 2026", ref: "GG-10102", amount: -432 },
  { id: "7", title: "ACH CREDIT - UNKNOWN", date: "Mar 09, 2026", ref: "ACH-55012", amount: 1250 },
  { id: "8", title: "BANK SERVICE FEE", date: "Mar 12, 2026", ref: "FEE-1016", amount: -45 },
  { id: "9", title: "ADP PAYROLL SEPT", date: "Mar 13, 2026", ref: "ADP-0930", amount: -28500 },
];

export function TransactionV1() {
  const [internal, setInternal] = useState(INTERNAL_DATA);
  const [bank, setBank] = useState(BANK_DATA);
  const [filter, setFilter] = useState<"all" | "reconciled" | "unreconciled">("all");

  const toggle = (id: string, list: Txn[], setter: any) => {
    setter(list.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const selectedInternal = internal.filter(i => i.selected);
  const selectedBank = bank.filter(b => b.selected);

  const totalInternal = selectedInternal.reduce((a, b) => a + b.amount, 0);
  const totalBank = selectedBank.reduce((a, b) => a + b.amount, 0);
  const delta = totalInternal - totalBank;

  // KPI
  const totalItems = internal.length;
  const reconciledCount = internal.filter(i => i.matched).length;
  const unreconciledCount = totalItems - reconciledCount;
  const progress = totalItems ? Math.round((reconciledCount / totalItems) * 100) : 0;

  const internalTotal = internal.reduce((a, b) => a + b.amount, 0);
  const bankTotal = bank.reduce((a, b) => a + b.amount, 0);
  const ledgerDiff = internalTotal - bankTotal;

  const handleMatch = () => {
    if (delta !== 0) return;

    const iIds = selectedInternal.map(i => i.id);
    const bIds = selectedBank.map(b => b.id);

    setInternal(prev => prev.map(i => iIds.includes(i.id) ? { ...i, matched: true, selected: false } : i));
    setBank(prev => prev.map(b => bIds.includes(b.id) ? { ...b, matched: true, selected: false } : b));
  };

  const handleAutoMatch = () => {
    const newInternal = [...internal];
    const newBank = [...bank];

    newInternal.forEach(i => {
      const match = newBank.find(b => !b.matched && Math.abs(b.amount - i.amount) < 1);
      if (match) {
        i.matched = true;
        match.matched = true;
      }
    });

    setInternal([...newInternal]);
    setBank([...newBank]);
  };

  const applyFilter = (list: Txn[]) => {
    if (filter === "reconciled") return list.filter(t => t.matched);
    if (filter === "unreconciled") return list.filter(t => !t.matched);
    return list;
  };

  const clearSelection = () => {
    setInternal(internal.map(i => ({ ...i, selected: false })));
    setBank(bank.map(b => ({ ...b, selected: false })));
  };

  const format = (amt: number) =>
    `${amt < 0 ? "-" : ""}$${Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[#0f172a]">March 2026 Reconciliation</h2>
            <p className="text-sm text-[#64748b] mt-0.5">March 1 – March 13, 2026</p>
          </div>
        </div>

        <button
          onClick={handleAutoMatch}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all shadow-sm bg-[#1a56db] text-white hover:bg-[#1d4ed8]"
        >
          <RefreshCw className="text-xs inline-block mr-2 lucide lucide-refresh-cw text-[#ffffff] icon-custom" />Auto-match All
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4" >
        <div className="bg-[#f0fdf4] border-[#bbf7d0] border rounded-xl p-4 flex items-start justify-between">
          <div className="text-sm font-medium text-[#334155]">
            <CheckCircle2 className="inline-block mr-2 lucide lucide-circle-check text-[#15803d] icon-custom" /> Progress</div>
          <p className="text-lg font-bold text-[#15803d]">{progress}%</p>
        </div>
        <div className="bg-[#f0f9ff] border-[#bae6fd] border rounded-xl p-4 flex items-start justify-between">
          <div className="text-sm font-medium text-[#334155]">
            <RefreshCw className="inline-block mr-2 lucide lucide-refresh-cw text-[#0ea5e9] icon-custom" />Reconciled</div>
          <p className="text-lg font-bold text-[#0369a1]">{reconciledCount}</p>
        </div>
        <div className="bg-[#fffbeb] border-[#fde68a] border rounded-xl p-4 flex items-start justify-between">
          <div className="text-sm font-medium text-[#334155]">
            <AlertTriangle className="inline-block mr-2 lucide lucide-alert-triangle text-[#b45309] icon-custom" />Unreconciled</div>
          <p className="text-lg font-bold text-[#b45309]">{unreconciledCount}</p>
        </div>
        <div className="bg-[#fef2f2] border-[#fecaca] border rounded-xl p-4 flex items-start justify-between">
          <div className="text-sm font-medium text-[#334155]">
            <Scale className="inline-block mr-2 lucide lucide-scale text-[#b91c1c] icon-custom" />Ledger Diff</div>
          <p style={myStyle} className={ledgerDiff === 0 ? "font-mono text-xl tabular-nums tracking-tight text-[#b45309]" : "text-red-500"}>
            {format(ledgerDiff) }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="text-xs text-[#94a3b8] mr-1">Filters:</span>
        {["all", "unreconciled", "reconciled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              filter === f ? "bg-[#1a56db] border-[#1a56db] text-white"
                        : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#1a56db] hover:text-[#1a56db]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-2 gap-4 flex-1">

        {/* Internal */}
        <div className="bg-white rounded-xl border-b border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="flex justify-between mb-2 items-center px-5 py-3.5 border-b border-[#f1f5f9] bg-[#fafbfc]">
            <h3 className="text-[#0f172a] flex items-center gap-2">Internal Ledger <div className="w-6 h-6 rounded-full bg-[#dbeafe] items-center justify-center flex"><span className=" text-[14px] font-bold text-[#1d4ed8]">{internal.length}</span></div></h3>
            <span className="font-mono text-xl tabular-nums tracking-tight text-[#0f172a]">{format(internalTotal)}</span>
          </div>

          {applyFilter(internal).map(txn => (
            <div
              key={txn.id}
              onClick={() => toggle(txn.id, internal, setInternal)}
              className={`px2-py4 border-b cursor-pointer mt-1 ${txn.selected ? "bg-blue-50 border-l-4 border-[#1d4ed8] border-b-0" : ""} ${txn.matched ? "opacity-40" : ""}`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f172a] whitespace-nowrap">{txn.title}</p>
                  <p className="text-xs text-[#94a3b8] font-mono">{txn.date} • {txn.ref}</p>
                </div>
                <p className="font-mono text-sm tabular-nums">${txn.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bank */}
        <div className="bg-white rounded-xl border-b border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="flex justify-between mb-2 items-center px-5 py-3.5 border-b border-[#f1f5f9] bg-[#fafbfc]">
            <h3 className="text-[#0f172a] flex items-center gap-2">Chase Bank ••4821 <div className="w-6 h-6 rounded-full bg-[#dbeafe] items-center justify-center flex"><span className=" text-[14px] font-bold text-[#1d4ed8]">{bank.length}</span></div></h3>
            <span className="font-mono text-xl tabular-nums tracking-tight text-[#0f172a]">{format(bankTotal)}</span>
          </div>

          {applyFilter(bank).map(txn => (
            <div
              key={txn.id}
              onClick={() => toggle(txn.id, bank, setBank)}
              className={`px2-py4 border-b cursor-pointer mt-1 ${txn.selected ? "bg-blue-50 border-l-4 border-[#1d4ed8] border-b-0" : ""} ${txn.matched ? "opacity-40" : ""}`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f172a] whitespace-nowrap">{txn.title}</p>
                  <p className="text-xs text-[#94a3b8] font-mono">{txn.date} • {txn.ref}</p>
                </div>
                <p className="font-mono text-sm tabular-nums">{format(txn.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 flex justify-between">
        <div className="text-sm text-[#64748b]">
          Selected: <span className="text-sm font-bold text-[#0f172a]">{selectedInternal.length + selectedBank.length}</span> &nbsp;&nbsp;
          Delta: <span className="font-mono text-sm tabular-nums flex-shrink-0  text-[#b91c1c]">{format(delta)}</span> &nbsp;&nbsp;
          <a onClick={clearSelection} className="text-blue-500 hover:text-blue-700">
            Clear
          </a>
        </div>

        <div className="flex gap-2" >
          <button onClick={clearSelection} className="rounded flex items-center gap-1.5 px-4 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#94a3b8] hover:text-[#334155] transition-all">
            Manual Match
          </button>

          <button
            onClick={handleMatch}
            disabled={delta !== 0}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm ${
              delta === 0 ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            Reconcile
          </button>
        </div>
      </div>
    </div>
  );
}