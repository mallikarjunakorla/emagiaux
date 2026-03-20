/**
 * transactionService.ts — API calls for the Transaction Matching Engine page.
 */

import { apiClient } from "./apiClient";
import type { ApiResponse, PaginatedResponse, TransactionFilterParams } from "../types/api";
import type { Transaction, MatchingKpis } from "../types/domain";
import type { CreateMatchPayload } from "../types/api";

const ENDPOINTS = {
  kpis: "/transactions/kpis",
  transactions: "/transactions",
  transaction: (id: string) => `/transactions/${id}`,
  autoMatch: "/transactions/auto-match",
  createMatch: "/transactions/matches",
  deleteMatch: (id: string) => `/transactions/matches/${id}`,
} as const;

export async function fetchMatchingKpis(
  signal?: AbortSignal
): Promise<ApiResponse<MatchingKpis>> {
  // return apiClient.get<ApiResponse<MatchingKpis>>(ENDPOINTS.kpis, undefined, signal);
  void signal;
  await simulateDelay(350);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: { totalItems: 25, matched: 14, unmatched: 6, underReview: 5, avgConfidence: 84 },
  };
}

export async function fetchTransactions(
  params: TransactionFilterParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Transaction>> {
  // return apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.transactions, params as Record<string, unknown>, signal);
  void params; void signal;
  await simulateDelay(500);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    pagination: { page: params.page ?? 1, pageSize: params.pageSize ?? 10, total: 25, totalPages: 3 },
    data: [],   // pages fetch their own mock data directly; this stubs the real endpoint
  };
}

/**
 * Trigger the AI auto-matching engine for a batch of unmatched transactions.
 * Maps to POST /transactions/auto-match
 */
export async function triggerAutoMatch(
  transactionIds?: string[],
  signal?: AbortSignal
): Promise<ApiResponse<{ matched: number; pending: number; jobId: string }>> {
  return apiClient.post(ENDPOINTS.autoMatch, { transactionIds }, signal);
}

/**
 * Manually create a match between a bank transaction and a GL entry.
 * Maps to POST /transactions/matches
 */
export async function createManualMatch(
  payload: CreateMatchPayload,
  signal?: AbortSignal
): Promise<ApiResponse<Transaction>> {
  return apiClient.post(ENDPOINTS.createMatch, payload, signal);
}

/**
 * Remove an existing match, returning both transactions to "unmatched".
 * Maps to DELETE /transactions/matches/:id
 */
export async function deleteMatch(
  matchId: string,
  signal?: AbortSignal
): Promise<ApiResponse<void>> {
  return apiClient.delete(ENDPOINTS.deleteMatch(matchId), signal);
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
