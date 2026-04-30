import useSWR from 'swr';

export type FinishedMatch = {
  id: string;
  time: string | number;
  ss?: string;
  league?: { id?: string | number; name?: string };
  home?: { id?: string | number; name?: string };
  away?: { id?: string | number; name?: string };
  odds?: {
    matchWinner?: {
      home_od?: string | number | null;
      away_od?: string | number | null;
      favorite?: string | null;
    } | null;
  } | null;
  consolidatedPredictions?: {
    matchWinner?: {
      home_probability?: number | null;
      away_probability?: number | null;
    } | null;
  } | null;
};

export type FinishedMatchesResponse = {
  success?: boolean;
  data?: FinishedMatch[];
  count?: number;
  total_count?: number | null;
};

function todayYYYYMMDD(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Finished matches for today — compact feed for the "Recent results" dashboard row.
 */
export function useFinishedToday(limit = 10) {
  const d = todayYYYYMMDD();
  const path = `/finished-matches?start_date=${d}&end_date=${d}&limit=${limit}&sort=time&order=desc&client_type=frontend`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<FinishedMatchesResponse>(path, { refreshInterval: 60_000 });

  return { data, error, isLoading, isValidating, refetch: mutate };
}
