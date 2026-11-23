"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseAsyncResult<T> {
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
  isLoading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useSync<T>(
  asyncFn: () => Promise<T>,
  deps: any[] = [],
): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      if (!controller.signal.aborted) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    execute();
    return () => abortRef.current?.abort();
  }, [execute]);

  return {
    data,
    setData: (d) => setData(d),
    isLoading,
    error,
    reload: execute,
  };
}
