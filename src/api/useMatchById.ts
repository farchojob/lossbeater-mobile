import { useEffect, useMemo } from 'react';
import { useSWRConfig } from 'swr';
import { useApiQuery } from './hooks';
import type { UpcomingMatch, UpcomingMatchesResponse } from './types';
import type { LiveMatch, LiveMatchesResponse } from './useLiveMatches';

export type AnyMatch = UpcomingMatch | LiveMatch;

type MatchResponse = {
  success?: boolean;
  data?: AnyMatch;
};

const POLL_LIVE_MS = 5_000;
const POLL_SCHEDULED_MS = 60_000;

/**
 * Fetches a single match by id with polling that adapts to time_status.
 * Uses the list SWR cache as initial data so the first paint is instant,
 * then /match/{id} refreshes in the background.
 */
export function useUpcomingMatchById(id: string | null | undefined): AnyMatch | null {
  const cached = useCachedFromLists(id);
  const path = id ? `/match/${id}` : null;
  const { data, refetch } = useApiQuery<MatchResponse>(path);

  const fresh = data?.data ?? null;
  const match = fresh ?? cached;

  const timeStatus = String(match ? (match as { time_status?: string | number }).time_status ?? '' : '');
  const intervalMs =
    timeStatus === '1' ? POLL_LIVE_MS : timeStatus === '3' ? 0 : POLL_SCHEDULED_MS;

  useEffect(() => {
    if (!path || intervalMs <= 0) return;
    const handle = setInterval(refetch, intervalMs);
    return () => clearInterval(handle);
  }, [path, intervalMs, refetch]);

  return match;
}

function useCachedFromLists(id: string | null | undefined): AnyMatch | null {
  const { cache } = useSWRConfig();

  return useMemo(() => {
    if (!id) return null;
    const keys = Array.from((cache as unknown as Map<string, unknown>).keys());

    for (const key of keys) {
      if (typeof key !== 'string') continue;
      if (!key.startsWith('/upcoming-matches/') && !key.startsWith('/live-matches/')) continue;

      const entry = cache.get(key) as
        | { data?: UpcomingMatchesResponse | LiveMatchesResponse }
        | undefined;
      const items = entry?.data?.data;
      if (!Array.isArray(items)) continue;

      const match = items.find((m) => String(m.id) === String(id));
      if (match) return match as AnyMatch;
    }
    return null;
  }, [cache, id]);
}
