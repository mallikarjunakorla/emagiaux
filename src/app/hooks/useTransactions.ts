/**
 * useTransactions.ts — Data hooks for the Transaction Matching Engine.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchMatchingKpis, triggerAutoMatch, createManualMatch } from "../services/transactionService";
import type { MatchingKpis } from "../types/domain";
import type { UseQueryState, UseMutationState, TransactionFilterParams, CreateMatchPayload } from "../types/api";

export const transactionQueryKeys = {
  all: ["transactions"] as const,
  kpis: () => [...transactionQueryKeys.all, "kpis"] as const,
  list: (params: TransactionFilterParams) =>
    [...transactionQueryKeys.all, "list", params] as const,
};

// ── useMatchingKpis ───────────────────────────────────────────────────────────

export function useMatchingKpis(): UseQueryState<MatchingKpis> {
  const [data, setData] = useState<MatchingKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMatchingKpis(abortRef.current.signal);
      setData(res.data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load matching KPIs");
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

// ── useAutoMatch ──────────────────────────────────────────────────────────────

export function useAutoMatch(): UseMutationState<string[] | undefined> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (transactionIds?: string[]) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await triggerAutoMatch(transactionIds);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Auto-match failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}

// ── useCreateMatch ────────────────────────────────────────────────────────────

export function useCreateMatch(): UseMutationState<CreateMatchPayload> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (payload: CreateMatchPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createManualMatch(payload);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to create match");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}
