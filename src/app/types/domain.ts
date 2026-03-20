/**
 * domain.ts — Canonical TypeScript types for the Cash Management Reconciliation System.
 * All pages and components import from here. Never duplicate type definitions elsewhere.
 */

// ── Primitives ────────────────────────────────────────────────────────────────

export type Currency = "USD" | "EUR" | "GBP" | "CHF" | "CAD" | "AUD" | "SGD" | "JPY" | "CNH";
export type Priority = "critical" | "high" | "medium" | "low";
export type TxStatus = "matched" | "unmatched" | "review";
export type ExceptionStatus = "open" | "review" | "escalated" | "resolved";
export type ReportFrequency = "Daily" | "Weekly" | "Monthly" | "On-Demand";
export type FileFormat = "PDF" | "XLSX" | "CSV";
export type TaskStatus = "completed" | "in-progress" | "pending" | "blocked" | "awaiting-approval";
export type ReconStatus = "reconciled" | "unmatched" | "exception" | "pending" | "in-progress";
export type ComplianceFramework = "SOX" | "IFRS" | "US-GAAP" | "BASEL-III" | "INTERNAL";

// ── Account ───────────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;          // masked, e.g. "****4521"
  currency: Currency;
  currentBalance: number;
  glBalance: number;
  variance: number;
  matchRate: number;              // 0-100
  openExceptions: number;
  lastReconciledAt: string;       // ISO 8601
  status: ReconStatus;
}

// ── Transaction ───────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  txnId: string;                  // e.g. "TXN-2026-084721"
  date: string;                   // ISO 8601 date
  description: string;
  counterparty: string;
  bankAmount: number | null;
  glAmount: number | null;
  currency: Currency;
  variance: number;
  confidence: number | null;      // 0-100 match confidence score
  status: TxStatus;
  accountId: string;
  accountName: string;
  bank: string;
  category: string;
  matchedToId?: string;           // ID of the paired GL/bank entry when matched
  reviewer?: string;
}

// ── Exception ─────────────────────────────────────────────────────────────────

export interface Exception {
  id: string;
  caseId: string;                 // e.g. "EXC-2026-0901"
  accountId: string;
  accountName: string;
  bank: string;
  exceptionType: string;          // "Amount Mismatch" | "Missing Transaction" | etc.
  amount: number;
  currency: Currency;
  age: number;                    // days since opened
  priority: Priority;
  status: ExceptionStatus;
  assigneeId: string;
  assigneeName: string;
  assigneeInitials: string;
  description: string;
  createdAt: string;              // ISO 8601
  dueAt: string;                  // ISO 8601
  updatedAt: string;              // ISO 8601
  resolutionNotes?: string;
  auditTrail?: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  actorInitials: string;
  actorName: string;
  action: string;
  timestamp: string;              // ISO 8601
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  frequency: ReportFrequency;
  formats: FileFormat[];
  category: string;
  lastGeneratedAt: string | null; // ISO 8601 | null if never run
  scheduleTime?: string;          // e.g. "07:00 EST"
  requiresDualApproval?: boolean;
}

export interface GeneratedReport {
  id: string;
  reportDefinitionId: string;
  reportName: string;
  generatedAt: string;            // ISO 8601
  generatedBy: string;            // "Scheduled" | user display name
  generatedByInitials: string;
  fileType: FileFormat;
  fileSizeBytes: number;
  downloadUrl: string;            // pre-signed URL or endpoint
  category: string;
  status: "ready" | "processing" | "failed";
}

// ── Period-End Close ──────────────────────────────────────────────────────────

export interface CloseTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: string;
  assigneeId: string;
  assigneeName: string;
  dueAt: string;                  // ISO 8601
  completedAt?: string;           // ISO 8601
  dependencies?: string[];        // IDs of tasks that must complete first
  signOffRequired?: boolean;
  signedOffBy?: string;
}

export interface ClosePeriod {
  id: string;
  periodName: string;             // e.g. "March 2026"
  startDate: string;              // ISO 8601
  endDate: string;                // ISO 8601
  dueDate: string;                // ISO 8601 — deadline for close
  status: "open" | "in-progress" | "awaiting-sign-off" | "closed";
  tasks: CloseTask[];
  completionPct: number;          // 0-100
  signedOffBy?: string;
  signedOffAt?: string;
}

// ── Compliance ────────────────────────────────────────────────────────────────

export interface ComplianceItem {
  id: string;
  framework: ComplianceFramework;
  controlId: string;              // e.g. "SOX-CC6.1"
  title: string;
  description: string;
  status: "compliant" | "non-compliant" | "in-review" | "not-assessed";
  lastAssessedAt: string;         // ISO 8601
  nextDueAt: string;              // ISO 8601
  owner: string;
  evidenceUrl?: string;
  risk: Priority;
}

// ── Dashboard KPIs ────────────────────────────────────────────────────────────

export interface DashboardKpis {
  totalAccounts: number;
  autoMatchRate: number;          // 0-100 percentage
  openExceptions: number;
  unmatchedValue: number;         // in base currency (USD)
  currency: Currency;
  asOfDate: string;               // ISO 8601
}

export interface MatchingKpis {
  totalItems: number;
  matched: number;
  unmatched: number;
  underReview: number;
  avgConfidence: number;          // 0-100
}

export interface ExceptionKpis {
  criticalCount: number;
  criticalAmount: number;
  highCount: number;
  highAmount: number;
  mediumCount: number;
  mediumAmount: number;
  lowCount: number;
  lowAmount: number;
}
