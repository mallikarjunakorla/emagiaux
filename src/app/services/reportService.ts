/**
 * reportService.ts — API calls for the Reports & Analytics page.
 */

import { apiClient } from "./apiClient";
import type { ApiResponse, PaginatedResponse, ReportFilterParams } from "../types/api";
import type { ReportDefinition, GeneratedReport } from "../types/domain";
import type { GenerateReportPayload } from "../types/api";

const ENDPOINTS = {
  definitions: "/reports/definitions",
  definition: (id: string) => `/reports/definitions/${id}`,
  generated: "/reports/generated",
  generate: "/reports/generate",
  download: (id: string) => `/reports/generated/${id}/download`,
  schedule: (id: string) => `/reports/definitions/${id}/schedule`,
} as const;

/**
 * Fetch the report catalogue (all available report types).
 * Maps to GET /reports/definitions
 */
export async function fetchReportDefinitions(
  signal?: AbortSignal
): Promise<ApiResponse<ReportDefinition[]>> {
  // return apiClient.get<ApiResponse<ReportDefinition[]>>(ENDPOINTS.definitions, undefined, signal);
  void signal;
  await simulateDelay(300);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: [],   // pages use their own static catalogue for now
  };
}

/**
 * Fetch the list of recently generated report files.
 * Maps to GET /reports/generated
 */
export async function fetchGeneratedReports(
  params: ReportFilterParams = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<GeneratedReport>> {
  // return apiClient.get<PaginatedResponse<GeneratedReport>>(ENDPOINTS.generated, params as Record<string, unknown>, signal);
  void params; void signal;
  await simulateDelay(500);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
    data: [],
  };
}

/**
 * Kick off a report generation job.
 * Maps to POST /reports/generate
 * Returns a job ID — poll /reports/generated for the finished file.
 */
export async function generateReport(
  payload: GenerateReportPayload,
  signal?: AbortSignal
): Promise<ApiResponse<{ jobId: string; estimatedSeconds: number }>> {
  return apiClient.post(ENDPOINTS.generate, payload, signal);
}

/**
 * Get a pre-signed download URL for a generated report.
 * Maps to GET /reports/generated/:id/download
 */
export async function getReportDownloadUrl(
  reportId: string,
  signal?: AbortSignal
): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
  return apiClient.get(ENDPOINTS.download(reportId), undefined, signal);
}

/**
 * Update the schedule for a report definition.
 * Maps to PATCH /reports/definitions/:id/schedule
 */
export async function updateReportSchedule(
  definitionId: string,
  scheduleTime: string,
  enabled: boolean,
  signal?: AbortSignal
): Promise<ApiResponse<ReportDefinition>> {
  return apiClient.patch(ENDPOINTS.schedule(definitionId), { scheduleTime, enabled }, signal);
}

function simulateDelay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
