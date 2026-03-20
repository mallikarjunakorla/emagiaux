import { useState, useMemo } from "react";
import { ReconciliationSummaryPanel } from "../components/ui/ReconciliationSummaryPanel";

const BANK_OPENING_BALANCE = 165_200_000.00;

export function ReconciliationSummary() {
  const [reconciliationData, setReconciliationData] = useState(null);
  
  const bankAccounts: Array<{ bankBalance: number; glBalance: number }> = [];
  const adjustments: Array<{ type: string; amount: number }> = [];

  const bankClosingBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + a.bankBalance, 166_381_651.25),
    [bankAccounts]
  );
  const glBalance = useMemo(
    () => bankAccounts.reduce((s, a) => s + a.glBalance, 166_376_390.50),
    [bankAccounts]
  );
  const totalAdditions = useMemo(
    () => adjustments.filter((a) => a.type === "add").reduce((s, a) => s + a.amount, 10_170.50),
    [adjustments]
  );
  const totalSubtractions = useMemo(
    () => adjustments.filter((a) => a.type === "subtract").reduce((s, a) => s + a.amount, 3_850.00),
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

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* ── Reconciliation Summary Panel ─────────────────────────────────────── */}
            <ReconciliationSummaryPanel
              openingBalance={BANK_OPENING_BALANCE}
              totalAdditions={totalAdditions}
              totalSubtractions={totalSubtractions}
              adjustedBankBalance={adjustedBankBalance}
              glBalance={glBalance}
              currency="USD"
              periodLabel="March 2026"
              asOfDate="March 13, 2026"
            />
    </div>
  );
}