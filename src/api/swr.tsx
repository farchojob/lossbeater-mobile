import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { SWRConfig, mutate } from 'swr';
import { apiRequest } from './client';

/**
 * SWR provider wired for React Native:
 *   - Fetcher uses Clerk JWT via a ref so token rotation doesn't remount.
 *   - RN has no `window.focus` — we use AppState to trigger revalidation.
 *   - Global dedupe 10s, errorRetryCount 2.
 */
export function SwrProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const tokenRef = useRef(getToken);
  useEffect(() => {
    tokenRef.current = getToken;
  }, [getToken]);

  const fetcher = useCallback(
    <T,>(path: string) => apiRequest<T>(path, () => tokenRef.current(), {}),
    [],
  );

  useEffect(() => {
    let lastFocus = Date.now();
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state !== 'active') return;
      if (Date.now() - lastFocus < 5000) return;
      lastFocus = Date.now();
      mutate(() => true);
    });
    return () => sub.remove();
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 10_000,
        errorRetryCount: 2,
        shouldRetryOnError: (err: unknown) => {
          if (err && typeof err === 'object' && 'status' in err) {
            const status = (err as { status?: number }).status;
            if (status && status >= 400 && status < 500) return false;
          }
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
