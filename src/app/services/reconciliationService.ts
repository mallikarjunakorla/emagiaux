/**
 * reconciliationService.ts — API calls for the Reconciliation Dashboard page.
 *
 * Each function maps directly to a backend endpoint. Replace the mock data
 * with real apiClient calls once your backend is available.
 */

import { apiClient, buildQueryString } from "./apiClient";
import type { ApiResponse, PaginatedResponse, AccountFilterParams } from "../types/api";
import type { BankAccount, DashboardKpis } from "../types/domain";

// ── Endpoints ──────────────────────────────────────────────────────────────────
// Adjust these paths to match your backend's API contract.

const ENDPOINTS = {
  kpis: "/reconciliation/kpis",
  accounts: "/reconciliation/accounts",
  account: (id: string) => `/reconciliation/accounts/${id}`,
  triggerRun: "/reconciliation/run",
} as const;

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetch top-level KPI metrics for the dashboard summary strip.
 * Maps to GET /reconciliation/kpis
 */
export async function fetchDashboardKpis(
  signal?: AbortSignal
): Promise<ApiResponse<DashboardKpis>> {
  // ── MOCK — replace with: ──────────────────────────────────────────────────
  // return apiClient.get<ApiResponse<DashboardKpis>>(ENDPOINTS.kpis, undefined, signal);
  // ─────────────────────────────────────────────────────────────────────────
  await simulateDelay(400);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      totalAccounts: 12,
      autoMatchRate: 98.7,
      openExceptions: 14,
      unmatchedValue: 8_534_000,
      currency: "USD",
      asOfDate: new Date().toISOString(),
    },
  };
}

/**
 * Fetch paginated list of bank accounts with reconciliation status.
 * Maps to GET /reconciliation/accounts
 */
export async function fetchAccounts(
  params: AccountFilterParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<BankAccount>> {
  // ── MOCK — replace with: ──────────────────────────────────────────────────
  // return apiClient.get<PaginatedResponse<BankAccount>>(ENDPOINTS.accounts, params as Record<string, unknown>, signal);
  // ─────────────────────────────────────────────────────────────────────────
  void signal;
  void params;
  await simulateDelay(600);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    pagination: { page: 1, pageSize: 25, total: 12, totalPages: 1 },
    data: MOCK_ACCOUNTS,
  };
}

/**
 * Fetch a single bank account by ID.
 * Maps to GET /reconciliation/accounts/:id
 */
export async function fetchAccountById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<BankAccount>> {
  return apiClient.get<ApiResponse<BankAccount>>(ENDPOINTS.account(id), undefined, signal);
}

/**
 * Trigger a full reconciliation run for all or specific accounts.
 * Maps to POST /reconciliation/run
 */
export async function triggerReconciliationRun(
  accountIds?: string[],
  signal?: AbortSignal
): Promise<ApiResponse<{ jobId: string; estimatedDurationSeconds: number }>> {
  return apiClient.post(ENDPOINTS.triggerRun, { accountIds }, signal);
}

// ── Mock data (remove once backend is live) ───────────────────────────────────

function simulateDelay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

const MOCK_ACCOUNTS: BankAccount[] = [
  { id: "ACC-001", name: "Operating – USD Primary", bank: "JPMorgan Chase", accountNumber: "****4521", currency: "USD", currentBalance: 45_820_300, glBalance: 45_820_300, variance: 0, matchRate: 100, openExceptions: 0, lastReconciledAt: "2026-03-13T07:00:00Z", status: "reconciled" },
  { id: "ACC-002", name: "Payroll – USD", bank: "Bank of America", accountNumber: "****8832", currency: "USD", currentBalance: 12_450_000, glBalance: 12_101_800, variance: 348200.5, matchRate: 97.2, openExceptions: 3, lastReconciledAt: "2026-03-13T07:00:00Z", status: "exception" },
  { id: "ACC-003", name: "Treasury – USD Reserve", bank: "JPMorgan Chase", accountNumber: "****1190", currency: "USD", currentBalance: 102_300_000, glBalance: 102_300_000, variance: 0, matchRate: 99.8, openExceptions: 1, lastReconciledAt: "2026-03-13T07:00:00Z", status: "reconciled" },
  { id: "ACC-004", name: "Hedging – EUR", bank: "Deutsche Bank", accountNumber: "****7741", currency: "EUR", currentBalance: 28_900_000, glBalance: 28_612_000, variance: 288000, matchRate: 94.1, openExceptions: 4, lastReconciledAt: "2026-03-12T18:00:00Z", status: "exception" },
  { id: "ACC-005", name: "Disbursements – GBP", bank: "HSBC", accountNumber: "****2255", currency: "GBP", currentBalance: 8_100_000, glBalance: 8_100_000, variance: 0, matchRate: 99.5, openExceptions: 0, lastReconciledAt: "2026-03-13T07:00:00Z", status: "reconciled" },
  { id: "ACC-006", name: "Capex – USD", bank: "Citibank", accountNumber: "****6688", currency: "USD", currentBalance: 34_720_000, glBalance: 34_275_000, variance: 445000, matchRate: 91.8, openExceptions: 5, lastReconciledAt: "2026-03-11T09:00:00Z", status: "exception" },
  { id: "ACC-007", name: "Intercompany – USD", bank: "Goldman Sachs", accountNumber: "****3317", currency: "USD", currentBalance: 215_000_000, glBalance: 213_550_000, variance: 1450000, matchRate: 88.3, openExceptions: 2, lastReconciledAt: "2026-03-10T12:00:00Z", status: "unmatched" },
  { id: "ACC-008", name: "Vendor Payments – CHF", bank: "UBS", accountNumber: "****9004", currency: "CHF", currentBalance: 4_280_000, glBalance: 4_280_000, variance: 0, matchRate: 99.9, openExceptions: 0, lastReconciledAt: "2026-03-13T07:00:00Z", status: "reconciled" },
];
