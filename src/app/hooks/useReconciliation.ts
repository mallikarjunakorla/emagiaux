/**
 * useReconciliation.ts — Data hooks for the Reconciliation Dashboard.
 *
 * Drop-in replacement for React Query's useQuery/useMutation.
 * Once you add @tanstack/react-query, replace the useState/useEffect
 * bodies with useQuery(queryKeys.kpis, fetchDashboardKpis) etc.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardKpis, fetchAccounts, triggerReconciliationRun } from "../services/reconciliationService";
import type { DashboardKpis, BankAccount } from "../types/domain";
import type { UseQueryState, UseMutationState, AccountFilterParams } from "../types/api";

// ── Query key constants (for cache invalidation when using React Query) ────────
export const reconciliationQueryKeys = {
  all: ["reconciliation"] as const,
  kpis: () => [...reconciliationQueryKeys.all, "kpis"] as const,
  accounts: (params: AccountFilterParams) =>
    [...reconciliationQueryKeys.all, "accounts", params] as const,
};

// ── useDashboardKpis ──────────────────────────────────────────────────────────

export function useDashboardKpis(): UseQueryState<DashboardKpis> {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardKpis(abortRef.current.signal);
      setData(res.data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load KPIs");
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

// ── useAccounts ───────────────────────────────────────────────────────────────

export function useAccounts(params: AccountFilterParams = {}): UseQueryState<BankAccount[]> {
  const [data, setData] = useState<BankAccount[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAccounts(params, abortRef.current.signal);
      setData(res.data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load accounts");
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── useReconciliationRun ──────────────────────────────────────────────────────

export function useReconciliationRun(): UseMutationState<string[] | undefined> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (accountIds?: string[]) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await triggerReconciliationRun(accountIds);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Reconciliation run failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { execute, loading, error, success, reset };
}
