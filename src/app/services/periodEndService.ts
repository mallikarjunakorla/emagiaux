/**
 * periodEndService.ts — API calls for the Period-End Close & Compliance page.
 */

import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { ClosePeriod, CloseTask, ComplianceItem } from "../types/domain";
import type { SignOffTaskPayload } from "../types/api";

const ENDPOINTS = {
  currentPeriod: "/period-end/current",
  periods: "/period-end/periods",
  period: (id: string) => `/period-end/periods/${id}`,
  tasks: (periodId: string) => `/period-end/periods/${periodId}/tasks`,
  task: (periodId: string, taskId: string) => `/period-end/periods/${periodId}/tasks/${taskId}`,
  signOffTask: (periodId: string, taskId: string) => `/period-end/periods/${periodId}/tasks/${taskId}/sign-off`,
  signOffPeriod: (periodId: string) => `/period-end/periods/${periodId}/sign-off`,
  compliance: "/period-end/compliance",
  complianceItem: (id: string) => `/period-end/compliance/${id}`,
} as const;

/**
 * Fetch the active period-end close package.
 * Maps to GET /period-end/current
 */
export async function fetchCurrentPeriod(
  signal?: AbortSignal
): Promise<ApiResponse<ClosePeriod>> {
  // return apiClient.get<ApiResponse<ClosePeriod>>(ENDPOINTS.currentPeriod, undefined, signal);
  void signal;
  await simulateDelay(450);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: MOCK_CURRENT_PERIOD,
  };
}

/**
 * Fetch tasks for a specific close period.
 * Maps to GET /period-end/periods/:id/tasks
 */
export async function fetchPeriodTasks(
  periodId: string,
  signal?: AbortSignal
): Promise<ApiResponse<CloseTask[]>> {
  return apiClient.get<ApiResponse<CloseTask[]>>(ENDPOINTS.tasks(periodId), undefined, signal);
}

/**
 * Update the status of a single close task.
 * Maps to PATCH /period-end/periods/:periodId/tasks/:taskId
 */
export async function updateTaskStatus(
  periodId: string,
  taskId: string,
  status: CloseTask["status"],
  signal?: AbortSignal
): Promise<ApiResponse<CloseTask>> {
  return apiClient.patch(ENDPOINTS.task(periodId, taskId), { status }, signal);
}

/**
 * Sign off a specific close task.
 * Maps to POST /period-end/periods/:periodId/tasks/:taskId/sign-off
 */
export async function signOffTask(
  periodId: string,
  payload: SignOffTaskPayload,
  signal?: AbortSignal
): Promise<ApiResponse<CloseTask>> {
  return apiClient.post(
    ENDPOINTS.signOffTask(periodId, payload.taskId),
    payload,
    signal
  );
}

/**
 * Submit the period-end sign-off for CFO/Controller approval.
 * Maps to POST /period-end/periods/:id/sign-off
 */
export async function signOffPeriod(
  periodId: string,
  signedOffBy: string,
  comments?: string,
  signal?: AbortSignal
): Promise<ApiResponse<ClosePeriod>> {
  return apiClient.post(ENDPOINTS.signOffPeriod(periodId), { signedOffBy, comments }, signal);
}

/**
 * Fetch compliance controls and their current status.
 * Maps to GET /period-end/compliance
 */
export async function fetchComplianceItems(
  signal?: AbortSignal
): Promise<ApiResponse<ComplianceItem[]>> {
  // return apiClient.get<ApiResponse<ComplianceItem[]>>(ENDPOINTS.compliance, undefined, signal);
  void signal;
  await simulateDelay(400);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: [],
  };
}

// ── Mock data ─────────────────────────────────────────────────────────────────

function simulateDelay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

const MOCK_CURRENT_PERIOD: ClosePeriod = {
  id: "PERIOD-2026-03",
  periodName: "March 2026",
  startDate: "2026-03-01",
  endDate: "2026-03-31",
  dueDate: "2026-04-05",
  status: "in-progress",
  completionPct: 62,
  tasks: [],
};
