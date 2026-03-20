/**
 * AdjustmentAttributesTable — Full CRUD table for pre-reconciliation adjustments.
 *
 * Manages inline add / edit forms, validations, and passes changes up via
 * callbacks so the parent page can update state and eventually call the API.
 *
 * Usage:
 *   <AdjustmentAttributesTable
 *     adjustments={adjustments}
 *     onAdd={handleAdd}
 *     onEdit={handleEdit}
 *     onDelete={handleDelete}
 *   />
 */

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Info,
  SlidersHorizontal,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { AddSubtractBadge } from "./AddSubtractBadge";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AdjustmentRow {
  id: string;
  type: "add" | "subtract";
  attributeName: string;
  amount: number;
  description: string;
  createdAt: string;
  createdBy?: string;
}

export type NewAdjustmentRow = Omit<AdjustmentRow, "id" | "createdAt" | "createdBy">;

// ── Props ──────────────────────────────────────────────────────────────────────

interface AdjustmentAttributesTableProps {
  adjustments: AdjustmentRow[];
  onAdd: (row: NewAdjustmentRow) => void;
  onEdit: (row: AdjustmentRow) => void;
  onDelete: (id: string) => void;
  currency?: string;
  readOnly?: boolean;
}

// ── Blank form state ───────────────────────────────────────────────────────────

const BLANK_FORM: NewAdjustmentRow = {
  type: "add",
  attributeName: "",
  amount: 0,
  description: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(v: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Sub-component: Inline form ─────────────────────────────────────────────────

interface AdjustmentRowFormProps {
  initial: NewAdjustmentRow;
  onSave: (row: NewAdjustmentRow) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function AdjustmentRowForm({
  initial,
  onSave,
  onCancel,
  isEdit = false,
}: AdjustmentRowFormProps) {
  const [form, setForm] = useState<NewAdjustmentRow>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof NewAdjustmentRow, string>>>({});

  const set = <K extends keyof NewAdjustmentRow>(k: K, v: NewAdjustmentRow[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.attributeName.trim()) errs.attributeName = "Attribute name is required";
    if (!form.amount || isNaN(form.amount) || form.amount <= 0) errs.amount = "Enter a valid positive amount";
    if (!form.description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  const inputBase =
    "w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-all text-[#0f172a] placeholder:text-[#cbd5e1]";
  const inputNormal = `${inputBase} border-[#e2e8f0] focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10`;
  const inputError = `${inputBase} border-[#fca5a5] bg-[#fef2f2] focus:border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/10`;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-1">
      {/* Form title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-[#dbeafe] rounded-lg flex items-center justify-center">
          <SlidersHorizontal size={13} className="text-[#1a56db]" />
        </div>
        <span className="text-sm font-bold text-[#0f172a]">
          {isEdit ? "Edit Adjustment" : "New Adjustment Attribute"}
        </span>
        <span className="text-xs text-[#94a3b8] ml-auto">All fields required</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Adjustment Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
            Adjustment Type *
          </label>
          <div className="flex gap-2">
            {(["add", "subtract"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                  form.type === t
                    ? t === "add"
                      ? "bg-[#dcfce7] border-[#86efac] text-[#15803d] shadow-sm"
                      : "bg-[#fee2e2] border-[#fca5a5] text-[#b91c1c] shadow-sm"
                    : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#1a56db] hover:text-[#1a56db]"
                }`}
              >
                {t === "add" ? (
                  <ArrowUpCircle size={13} />
                ) : (
                  <ArrowDownCircle size={13} />
                )}
                {t === "add" ? "Add" : "Subtract"}
              </button>
            ))}
          </div>
        </div>

        {/* Attribute Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
            Attribute Name *
          </label>
          <input
            type="text"
            value={form.attributeName}
            onChange={(e) => set("attributeName", e.target.value)}
            placeholder="e.g. Bank Charges, Interest Earned"
            className={errors.attributeName ? inputError : inputNormal}
          />
          {errors.attributeName && (
            <span className="text-[10px] text-[#ef4444]">{errors.attributeName}</span>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
            Amount (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8] pointer-events-none font-mono">
              $
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount || ""}
              onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={`${errors.amount ? inputError : inputNormal} pl-7 font-mono`}
            />
          </div>
          {errors.amount && (
            <span className="text-[10px] text-[#ef4444]">{errors.amount}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
            Description / Notes *
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Reason for this adjustment"
            className={errors.description ? inputError : inputNormal}
          />
          {errors.description && (
            <span className="text-[10px] text-[#ef4444]">{errors.description}</span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#e2e8f0]">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:border-[#94a3b8] hover:text-[#334155] transition-all"
        >
          <X size={13} /> Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#1a56db] rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm"
        >
          <Save size={13} /> {isEdit ? "Save Changes" : "Add Adjustment"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AdjustmentAttributesTable({
  adjustments,
  onAdd,
  onEdit,
  onDelete,
  currency = "USD",
  readOnly = false,
}: AdjustmentAttributesTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalAdditions = adjustments
    .filter((a) => a.type === "add")
    .reduce((s, a) => s + a.amount, 0);
  const totalSubtractions = adjustments
    .filter((a) => a.type === "subtract")
    .reduce((s, a) => s + a.amount, 0);
  const netAdjustment = totalAdditions - totalSubtractions;

  const handleAdd = (row: NewAdjustmentRow) => {
    onAdd(row);
    setShowAddForm(false);
  };

  const handleEdit = (row: AdjustmentRow, updated: NewAdjustmentRow) => {
    onEdit({ ...row, ...updated });
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f1f5f9] bg-[#fafbfc]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center">
            <SlidersHorizontal size={15} className="text-[#1a56db]" />
          </div>
          <div>
            <h3 className="text-[#0f172a]">Adjustment Attributes</h3>
            <p className="text-xs text-[#64748b]">
              {adjustments.length} adjustment{adjustments.length !== 1 ? "s" : ""} · Pre-reconciliation entries
            </p>
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setShowAddForm((p) => !p);
              setEditingId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all shadow-sm ${
              showAddForm
                ? "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
                : "bg-[#1a56db] text-white hover:bg-[#1d4ed8]"
            }`}
          >
            {showAddForm ? (
              <>
                <X size={13} /> Cancel
              </>
            ) : (
              <>
                <Plus size={13} /> Add Adjustment
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Add form */}
        {showAddForm && !readOnly && (
          <AdjustmentRowForm
            initial={BLANK_FORM}
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Table */}
        {adjustments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-3">
              <SlidersHorizontal size={20} className="text-[#94a3b8]" />
            </div>
            <p className="text-sm font-medium text-[#334155]">No adjustments added</p>
            <p className="text-xs text-[#94a3b8] mt-1">
              Click "Add Adjustment" to add Bank Charges, Interest, NSF items, etc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#f1f5f9]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {["#", "Type", "Attribute Name", "Amount", "Description", "Added On", "By", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {adjustments
                  .flatMap((row, idx) => {
                    if (editingId === row.id) {
                      // Render only the inline edit form row
                      return [
                        <tr key={`edit-${row.id}`}>
                          <td
                            colSpan={8}
                            className="px-4 py-2 border-b border-[#f1f5f9] bg-[#f8fafc]"
                          >
                            <AdjustmentRowForm
                              isEdit
                              initial={{
                                type: row.type,
                                attributeName: row.attributeName,
                                amount: row.amount,
                                description: row.description,
                              }}
                              onSave={(updated) => handleEdit(row, updated)}
                              onCancel={() => setEditingId(null)}
                            />
                          </td>
                        </tr>,
                      ];
                    }
                    // Render the normal data row
                    return [
                      <tr
                        key={row.id}
                        className={`border-b border-[#f8fafc] transition-colors hover:bg-[#fafbff] ${
                          deletingId === row.id ? "bg-[#fef2f2]" : ""
                        }`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-xs text-[#94a3b8] font-mono w-8">
                          {idx + 1}
                        </td>
                        {/* Type */}
                        <td className="px-4 py-3 w-24">
                          <AddSubtractBadge type={row.type} variant="chip" />
                        </td>
                        {/* Attribute Name */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-[#0f172a]">
                            {row.attributeName}
                          </span>
                        </td>
                        {/* Amount */}
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-mono text-sm ${
                              row.type === "add"
                                ? "text-[#15803d]"
                                : "text-[#b91c1c]"
                            }`}
                          >
                            {row.type === "add" ? "+" : "−"}{" "}
                            {formatCurrency(row.amount, currency)}
                          </span>
                        </td>
                        {/* Description */}
                        <td className="px-4 py-3 max-w-[260px]">
                          <span className="text-xs text-[#64748b] leading-relaxed">
                            {row.description}
                          </span>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-[#94a3b8]">
                            {formatDate(row.createdAt)}
                          </span>
                        </td>
                        {/* By */}
                        <td className="px-4 py-3">
                          {row.createdBy ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-bold text-[#1d4ed8]">
                                  {row.createdBy
                                    .split(" ")
                                    .map((p) => p[0])
                                    .join("")}
                                </span>
                              </div>
                              <span className="text-xs text-[#64748b] whitespace-nowrap">
                                {row.createdBy}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#cbd5e1]">—</span>
                          )}
                        </td>
                        {/* Actions */}
                        {!readOnly && (
                          <td className="px-4 py-3">
                            {deletingId === row.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-[#b91c1c] mr-1">Delete?</span>
                                <button
                                  onClick={() => confirmDelete(row.id)}
                                  className="px-2 py-1 text-xs font-semibold text-white bg-[#ef4444] rounded hover:bg-[#dc2626] transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-1 text-xs font-semibold text-[#64748b] bg-[#f1f5f9] rounded hover:bg-[#e2e8f0] transition-colors"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingId(row.id);
                                    setShowAddForm(false);
                                  }}
                                  title="Edit"
                                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#64748b] hover:bg-[#dbeafe] hover:text-[#1a56db] transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeletingId(row.id)}
                                  title="Delete"
                                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>,
                    ];
                  })}
              </tbody>

              {/* Summary footer */}
              <tfoot>
                <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                  <td colSpan={3} className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <Info size={12} className="text-[#94a3b8]" />
                      <span>
                        {adjustments.length} adjustment{adjustments.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </td>
                  <td colSpan={2} className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 items-end">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#64748b]">Total Additions:</span>
                        <span className="font-mono text-[#15803d]">
                          +{formatCurrency(totalAdditions, currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#64748b]">Total Subtractions:</span>
                        <span className="font-mono text-[#b91c1c]">
                          −{formatCurrency(totalSubtractions, currency)}
                        </span>
                      </div>
                      <div className="h-px w-full bg-[#e2e8f0] my-1" />
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#334155] font-semibold">Net Adjustment:</span>
                        <span
                          className={`font-mono text-sm ${
                            netAdjustment > 0
                              ? "text-[#15803d]"
                              : netAdjustment < 0
                              ? "text-[#b91c1c]"
                              : "text-[#64748b]"
                          }`}
                        >
                          {netAdjustment > 0 ? "+" : ""}
                          {formatCurrency(netAdjustment, currency)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}