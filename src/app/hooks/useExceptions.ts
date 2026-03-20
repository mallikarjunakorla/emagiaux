/**
 * useExceptions.ts — Data hooks for the Exception Management page.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchExceptionKpis, resolveException, escalateException, bulkResolveExceptions } from "../services/exceptionService";
import type { ExceptionKpis } from "../types/domain";
import type { UseQueryState, UseMutationState, ResolveExceptionPayload } from "../types/api";

export const exceptionQueryKeys = {
  all: ["exceptions"] as const,
  kpis: () => [...exceptionQueryKeys.all, "kpis"] as const,
  list: (params: object) => [...exceptionQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...exceptionQueryKeys.all, "detail", id] as const,
};

// ── useExceptionKpis ──────────────────────────────────────────────────────────

export function useExceptionKpis(): UseQueryState<ExceptionKpis> {
  const [data, setData] = useState<ExceptionKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExceptionKpis(abortRef.current.signal);
      setData(res.data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load exception KPIs");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── useResolveException ───────────────────────────────────────────────────────

export function useResolveException(
  exceptionId: string
): UseMutationState<ResolveExceptionPayload> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (payload: ResolveExceptionPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await resolveException(exceptionId, payload);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to resolve exception");
    } finally {
      setLoading(false);
    }
  }, [exceptionId]);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}

// ── useEscalateException ──────────────────────────────────────────────────────

export function useEscalateException(exceptionId: string): UseMutationState<string> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (notes: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await escalateException(exceptionId, notes);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to escalate exception");
    } finally {
      setLoading(false);
    }
  }, [exceptionId]);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}

// ── useBulkResolve ────────────────────────────────────────────────────────────

interface BulkResolveArgs {
  ids: string[];
  payload: ResolveExceptionPayload;
}

export function useBulkResolve(): UseMutationState<BulkResolveArgs> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ ids, payload }: BulkResolveArgs) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await bulkResolveExceptions(ids, payload);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Bulk resolve failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}
