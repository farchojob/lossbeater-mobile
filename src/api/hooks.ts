import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, apiRequest, RequestOptions } from './client';

/**
 * Returns a stable `request` function bound to the current Clerk session.
 * `getToken` from Clerk is not guaranteed stable across renders, so we stash
 * the latest reference in a ref and keep `request` memoized with empty deps —
 * otherwise downstream effects fire on every render.
 */
export function useApi() {
  const { getToken, isSignedIn } = useAuth();
  const tokenRef = useRef(getToken);
  useEffect(() => {
    tokenRef.current = getToken;
  }, [getToken]);

  const request = useCallback(
    <T,>(path: string, options?: RequestOptions) =>
      apiRequest<T>(path, () => tokenRef.current(), options ?? {}),
    [],
  );

  return { request, isSignedIn };
}

export type ApiQueryState<T> = {
  data: T | null;
  error: ApiError | Error | null;
  loading: boolean;
  refetch: () => void;
};

/**
 * Minimal data hook: fetch once on mount + on `path` change, plus manual refetch.
 * Skips the request until Clerk is signed in so we never fire with a null token.
 */
export function useApiQuery<T>(path: string | null): ApiQueryState<T> {
  const { request, isSignedIn } = useApi();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [loading, setLoading] = useState(false);
  const tick = useRef(0);

  const refetch = useCallback(async () => {
    if (!path || !isSignedIn) return;
    const ticket = ++tick.current;
    setLoading(true);
    setError(null);
    try {
      const res = await request<T>(path);
      if (ticket === tick.current) setData(res);
    } catch (e) {
      if (ticket === tick.current) setError(e as Error);
    } finally {
      if (ticket === tick.current) setLoading(false);
    }
  }, [path, isSignedIn, request]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}
