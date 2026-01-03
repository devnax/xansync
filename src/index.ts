"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useSync<T>(asyncFn: () => Promise<T>, deps: any[] = []): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      if (!controller.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    execute();
    return () => abortRef.current?.abort();
  }, [execute]);

  return { data, isLoading, error, reload: execute };
}

type AsyncRenderer<T> = (data: T) => React.ReactNode;

export function withAsync<T>(
  loader: () => Promise<T>,
  render: AsyncRenderer<T>,
  fallback?: React.ReactNode,
  onError?: (error: Error) => React.ReactNode
) {
  return function AsyncComponent() {
    const { data, isLoading, error } = useSync(loader, []);

    if (isLoading) return fallback ?? null;
    if (error) return onError ? onError(error) : null;
    if (data == null) return null;

    return render(data);
  };
}
