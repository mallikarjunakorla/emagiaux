/**
 * usePeriodEnd.ts — Data hooks for the Period-End Close & Compliance page.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCurrentPeriod, updateTaskStatus, signOffTask, signOffPeriod } from "../services/periodEndService";
import type { ClosePeriod, CloseTask } from "../types/domain";
import type { UseQueryState, UseMutationState, SignOffTaskPayload } from "../types/api";

// ── useCurrentPeriod ──────────────────────────────────────────────────────────

export function useCurrentPeriod(): UseQueryState<ClosePeriod> {
  const [data, setData] = useState<ClosePeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurrentPeriod(abortRef.current.signal);
      setData(res.data);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message ?? "Failed to load period close data");
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

// ── useUpdateTaskStatus ───────────────────────────────────────────────────────

interface UpdateTaskArgs {
  periodId: string;
  taskId: string;
  status: CloseTask["status"];
}

export function useUpdateTaskStatus(): UseMutationState<UpdateTaskArgs> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ periodId, taskId, status }: UpdateTaskArgs) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateTaskStatus(periodId, taskId, status);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Failed to update task");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}

// ── useSignOffTask ────────────────────────────────────────────────────────────

interface SignOffArgs {
  periodId: string;
  payload: SignOffTaskPayload;
}

export function useSignOffTask(): UseMutationState<SignOffArgs> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ periodId, payload }: SignOffArgs) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await signOffTask(periodId, payload);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Sign-off failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}

// ── useSignOffPeriod ──────────────────────────────────────────────────────────

interface PeriodSignOffArgs {
  periodId: string;
  signedOffBy: string;
  comments?: string;
}

export function useSignOffPeriod(): UseMutationState<PeriodSignOffArgs> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async ({ periodId, signedOffBy, comments }: PeriodSignOffArgs) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await signOffPeriod(periodId, signedOffBy, comments);
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message ?? "Period sign-off failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { execute, loading, error, success, reset };
}
