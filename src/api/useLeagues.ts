import useSWR from 'swr';

export type ActiveLeague = {
  id: number;
  name: string;
  country: string;
  importance?: number;
  live: number;
  upcoming: number;
  finished: number;
  last_activity?: number;
};

type ActiveLeaguesResponse = {
  success?: boolean;
  data?: ActiveLeague[];
  count?: number;
};

/**
 * Fetch live+upcoming+finished league counts for the current trading day.
 * Backend endpoint: /leagues/active. Cached 60s server-side.
 */
export function useLeagues(date?: string) {
  const path = date ? `/leagues/active?date=${date}` : '/leagues/active';
  const { data, error, isLoading, mutate } = useSWR<ActiveLeaguesResponse>(path, {
    refreshInterval: 60_000,
  });

  const leagues = data?.data ?? [];

  return { leagues, isLoading, error, refetch: mutate };
}
