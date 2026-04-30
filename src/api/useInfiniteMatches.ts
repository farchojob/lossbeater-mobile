import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { UpcomingMatch, UpcomingMatchesResponse } from './types';
import type { LiveMatch, LiveMatchesResponse } from './useLiveMatches';
import type { FinishedMatch, FinishedMatchesResponse } from './useFinishedToday';
import {
  buildFilterQueryParams,
  type SmartFilterId,
} from '../constants/smartFilters';

type Pageable = {
  data?: unknown[];
  total?: number | null;
  total_count?: number | null;
};

export type InfiniteListResult<T> = {
  items: T[];
  total: number | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<unknown>;
};

function useGrowingList<T, R extends Pageable>(
  buildPath: (limit: number) => string,
  pageSize: number,
  refreshInterval?: number,
): InfiniteListResult<T> {
  const [limit, setLimit] = useState(pageSize);
  const path = buildPath(limit);

  const { data, error, isLoading, isValidating, mutate } = useSWR<R>(path, {
    refreshInterval,
    keepPreviousData: true,
  });

  const items = ((data?.data as T[] | undefined) ?? []);
  const total =
    ((data?.total_count ?? data?.total ?? null) as number | null);
  const hasMore = total != null ? items.length < total : items.length >= limit;
  const isLoadingMore = isValidating && !isLoading && items.length < limit;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setLimit((l) => l + pageSize);
  }, [hasMore, pageSize]);

  const refetch = useCallback(async () => {
    setLimit(pageSize);
    await mutate();
  }, [mutate, pageSize]);

  return {
    items,
    total,
    isLoading: isLoading && items.length === 0,
    isLoadingMore,
    isError: !!error && items.length === 0,
    hasMore,
    loadMore,
    refetch,
  };
}

export function useLiveMatchesInfinite(
  pageSize: number,
  leagueId?: string | null,
) {
  const build = useCallback(
    (limit: number) => {
      const params = new URLSearchParams({
        client_type: 'frontend',
        limit: String(limit),
      });
      if (leagueId) params.set('league_id', leagueId);
      return `/live-matches/?${params.toString()}`;
    },
    [leagueId],
  );
  return useGrowingList<LiveMatch, LiveMatchesResponse>(build, pageSize, 8_000);
}

export function useUpcomingMatchesInfinite(
  pageSize: number,
  leagueId?: string | null,
  date?: string | null,
  filters?: ReadonlyArray<SmartFilterId>,
) {
  const effectiveDate = date ?? todayYYYYMMDDDashed();
  const filterKey = useMemo(
    () => (filters && filters.length > 0 ? [...filters].sort().join(',') : ''),
    [filters],
  );
  const build = useCallback(
    (limit: number) => {
      const params = new URLSearchParams({
        client_type: 'frontend',
        limit: String(limit),
        sort: 'time',
        order: 'asc',
        date: effectiveDate,
      });
      if (leagueId) params.set('league_id', leagueId);
      if (filters && filters.length > 0) {
        const filterParams = buildFilterQueryParams(filters);
        for (const [k, v] of Object.entries(filterParams)) params.set(k, v);
      }
      return `/upcoming-matches/?${params.toString()}`;
    },
    [leagueId, effectiveDate, filterKey],
  );
  return useGrowingList<UpcomingMatch, UpcomingMatchesResponse>(
    build,
    pageSize,
    60_000,
  );
}

function todayYYYYMMDDDashed(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function useFinishedMatchesInfinite(pageSize: number) {
  const d = todayYYYYMMDD();
  const build = useCallback(
    (limit: number) =>
      `/finished-matches/?start_date=${d}&end_date=${d}&limit=${limit}&sort=time&order=desc&client_type=frontend`,
    [d],
  );
  return useGrowingList<FinishedMatch, FinishedMatchesResponse>(
    build,
    pageSize,
    60_000,
  );
}
