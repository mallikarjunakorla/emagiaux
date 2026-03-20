import { useState } from "react";
import {
  AdjustmentAttributesTable,
  type AdjustmentRow,
  type NewAdjustmentRow,
} from "../components/ui/AdjustmentAttributesTable";

export function AdjustmentAttributes() {
  const handleAddAdjustment = (adjustment: NewAdjustmentRow) => {
    const newAdjustment: AdjustmentRow = {
      ...adjustment,
      id: nextAdjId(),
      createdAt: new Date().toISOString(),
    };
    setAdjustments([...adjustments, newAdjustment]);
  };

  const handleEditAdjustment = (row: AdjustmentRow) => {
    setAdjustments(adjustments.map(a => a.id === row.id ? row : a));
  };

  const handleDeleteAdjustment = (id: string) => {
    setAdjustments(adjustments.filter(a => a.id !== id));
  };

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

let adjIdCounter = DEFAULT_ADJUSTMENTS.length + 1;
function nextAdjId(): string {
  return `adj-${String(adjIdCounter++).padStart(3, "0")}`;
}

const [adjustments, setAdjustments] = useState<AdjustmentRow[]>(() => DEFAULT_ADJUSTMENTS);

  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* ── Adjustment Attributes ─────────────────────────────────────────────── */}
      <AdjustmentAttributesTable
        adjustments={adjustments}
        onAdd={handleAddAdjustment}
        onEdit={handleEditAdjustment}
        onDelete={handleDeleteAdjustment}
        currency="USD"
      />
    </div>
  );
}