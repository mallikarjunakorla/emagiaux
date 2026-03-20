/**
 * api.ts — API envelope types, pagination, and filter params.
 * All service functions wrap their responses in these types.
 */

// ── Response Wrappers ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;              // ISO 8601
  requestId?: string;             // trace ID for debugging
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  success: boolean;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;                   // machine-readable, e.g. "VALIDATION_ERROR"
  message: string;                // human-readable
  status: number;                 // HTTP status code
  details?: Record<string, string[]>;
  requestId?: string;
}

// ── Filter / Query Params ─────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DateRangeParams {
  dateFrom?: string;              // ISO 8601 date "YYYY-MM-DD"
  dateTo?: string;
}

export interface TransactionFilterParams extends PaginationParams, SortParams, DateRangeParams {
  search?: string;
  status?: string;
  accountId?: string;
  bank?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExceptionFilterParams extends PaginationParams, SortParams, DateRangeParams {
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  accountId?: string;
  exceptionType?: string;
}

export interface ReportFilterParams extends PaginationParams {
  search?: string;
  fileType?: string;
  category?: string;
  generatedBy?: string;
}

export interface AccountFilterParams extends PaginationParams, SortParams {
  search?: string;
  bank?: string;
  currency?: string;
  status?: string;
}

// ── Mutation Payloads ─────────────────────────────────────────────────────────

export interface ResolveExceptionPayload {
  action: "write-off" | "reclassify" | "await-bank" | "manual-adjustment" | "escalate";
  notes: string;
  glAccountCode?: string;         // required for "reclassify"
  approvedBy?: string;            // required for "write-off" (dual approval)
}

export interface CreateMatchPayload {
  bankTransactionId: string;
  glTransactionId: string;
  notes?: string;
}

export interface GenerateReportPayload {
  reportDefinitionId: string;
  format: "PDF" | "XLSX" | "CSV";
  dateFrom?: string;
  dateTo?: string;
  accountIds?: string[];
}

export interface SignOffTaskPayload {
  taskId: string;
  signedOffBy: string;
  comments?: string;
  evidenceAttachmentIds?: string[];
}

// ── Hook State Shape ──────────────────────────────────────────────────────────

export interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseMutationState<T> {
  execute: (payload: T) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}
