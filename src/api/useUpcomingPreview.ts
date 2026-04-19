import useSWR from 'swr';
import type { UpcomingMatchesResponse } from './types';

/**
 * Unfiltered upcoming feed (no `quality_picks` filter) — sorted by earliest tip-off.
 */
export function useUpcomingPreview(limit = 15, leagueId?: string | null) {
  const params = new URLSearchParams({
    client_type: 'frontend',
    limit: String(limit),
    sort: 'time',
    order: 'asc',
  });
  if (leagueId) params.set('league_id', leagueId);
  const path = `/upcoming-matches/?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<UpcomingMatchesResponse>(path, { refreshInterval: 60_000 });

  return { data, error, isLoading, isValidating, refetch: mutate };
}
