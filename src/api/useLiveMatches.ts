import useSWR from 'swr';

export type SetScore = { home: string; away: string };

export type LiveMatch = {
  id: string;
  time: string | number;
  ss?: string;
  league?: { id?: string | number; name?: string } | null;
  home?: {
    id?: string | number;
    name?: string;
    score?: number | null;
  } | null;
  away?: {
    id?: string | number;
    name?: string;
    score?: number | null;
  } | null;
  scores?: Record<string, SetScore> | null;
  current_set?: number | null;
  odds?: {
    matchWinner?: {
      home_od?: string | number | null;
      away_od?: string | number | null;
    } | null;
  } | null;
  consolidatedPredictions?: {
    matchWinner?: {
      home_probability?: number | null;
      away_probability?: number | null;
    } | null;
  } | null;
};

export type LiveMatchesResponse = {
  success?: boolean;
  data?: LiveMatch[];
  count?: number;
  total?: number | null;
};

export function useLiveMatches(limit = 60, leagueId?: string | null) {
  const params = new URLSearchParams({
    client_type: 'frontend',
    limit: String(limit),
  });
  if (leagueId) params.set('league_id', leagueId);
  const path = `/live-matches/?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<LiveMatchesResponse>(path, {
      refreshInterval: 8_000,
      dedupingInterval: 3_000,
    });

  return { data, error, isLoading, isValidating, refetch: mutate };
}
