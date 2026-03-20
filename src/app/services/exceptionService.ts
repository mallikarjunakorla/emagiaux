/**
 * exceptionService.ts — API calls for the Exception Management page.
 */

import { apiClient } from "./apiClient";
import type { ApiResponse, PaginatedResponse, ExceptionFilterParams } from "../types/api";
import type { Exception, ExceptionKpis } from "../types/domain";
import type { ResolveExceptionPayload } from "../types/api";

const ENDPOINTS = {
  kpis: "/exceptions/kpis",
  exceptions: "/exceptions",
  exception: (id: string) => `/exceptions/${id}`,
  resolve: (id: string) => `/exceptions/${id}/resolve`,
  escalate: (id: string) => `/exceptions/${id}/escalate`,
  assign: (id: string) => `/exceptions/${id}/assign`,
  bulkResolve: "/exceptions/bulk-resolve",
  bulkEscalate: "/exceptions/bulk-escalate",
} as const;

export async function fetchExceptionKpis(
  signal?: AbortSignal
): Promise<ApiResponse<ExceptionKpis>> {
  // return apiClient.get<ApiResponse<ExceptionKpis>>(ENDPOINTS.kpis, undefined, signal);
  void signal;
  await simulateDelay(300);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      criticalCount: 4, criticalAmount: 7_630_000,
      highCount: 5, highAmount: 2_304_100,
      mediumCount: 7, mediumAmount: 452_720,
      lowCount: 4, lowAmount: 43_250,
    },
  };
}

export async function fetchExceptions(
  params: ExceptionFilterParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<Exception>> {
  // return apiClient.get<PaginatedResponse<Exception>>(ENDPOINTS.exceptions, params as Record<string, unknown>, signal);
  void params; void signal;
  await simulateDelay(550);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    pagination: { page: params.page ?? 1, pageSize: params.pageSize ?? 10, total: 20, totalPages: 2 },
    data: [],
  };
}

export async function fetchExceptionById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<Exception>> {
  return apiClient.get<ApiResponse<Exception>>(ENDPOINTS.exception(id), undefined, signal);
}

/**
 * Resolve a single exception with an action and audit notes.
 * Maps to POST /exceptions/:id/resolve
 */
export async function resolveException(
  id: string,
  payload: ResolveExceptionPayload,
  signal?: AbortSignal
): Promise<ApiResponse<Exception>> {
  return apiClient.post(ENDPOINTS.resolve(id), payload, signal);
}

/**
 * Escalate a single exception to senior controller.
 * Maps to POST /exceptions/:id/escalate
 */
export async function escalateException(
  id: string,
  notes: string,
  signal?: AbortSignal
): Promise<ApiResponse<Exception>> {
  return apiClient.post(ENDPOINTS.escalate(id), { notes }, signal);
}

/**
 * Re-assign an exception to a different analyst.
 * Maps to PATCH /exceptions/:id/assign
 */
export async function assignException(
  id: string,
  assigneeId: string,
  signal?: AbortSignal
): Promise<ApiResponse<Exception>> {
  return apiClient.patch(ENDPOINTS.assign(id), { assigneeId }, signal);
}

/**
 * Bulk resolve multiple exceptions with the same action.
 * Maps to POST /exceptions/bulk-resolve
 */
export async function bulkResolveExceptions(
  ids: string[],
  payload: ResolveExceptionPayload,
  signal?: AbortSignal
): Promise<ApiResponse<{ resolved: number; failed: number }>> {
  return apiClient.post(ENDPOINTS.bulkResolve, { ids, ...payload }, signal);
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
