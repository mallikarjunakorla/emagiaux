/**
 * apiClient.ts — Base HTTP client for all API calls.
 *
 * Replace VITE_API_BASE_URL in your .env file with your real backend URL.
 * Swap the auth comment block to inject your JWT / session token.
 *
 * For React Query integration, pass the underlying fetch functions
 * directly as queryFns — the apiClient returns raw promises.
 */

const BASE_URL =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ??
  "https://api.cashrecon.internal/v1";

// ── Token accessor ────────────────────────────────────────────────────────────
// Replace this with your actual auth store (Zustand, Context, localStorage, etc.)
function getAuthToken(): string | null {
  // Example: return localStorage.getItem("access_token");
  return null;
}

// ── Core request function ─────────────────────────────────────────────────────

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, signal } = options;

  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage;
    } catch {
      // response body wasn't JSON — use default message
    }
    const err = new Error(errorMessage) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Query-string builder ──────────────────────────────────────────────────────

export function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return filtered.length > 0 ? `?${filtered.join("&")}` : "";
}

// ── Exported client ───────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(endpoint: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const qs = params ? buildQueryString(params) : "";
    return request<T>(`${endpoint}${qs}`, { signal });
  },

  post<T>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>(endpoint, { method: "POST", body, signal });
  },

  put<T>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>(endpoint, { method: "PUT", body, signal });
  },

  patch<T>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>(endpoint, { method: "PATCH", body, signal });
  },

  delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return request<T>(endpoint, { method: "DELETE", signal });
  },
};
