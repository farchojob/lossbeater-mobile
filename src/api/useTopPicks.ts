import { useApiQuery } from './hooks';
import type { UpcomingMatchesResponse } from './types';

/**
 * Today's top pick feed for the mobile home screen.
 * Backend strips premium fields per tier; free users still see pickQuality +
 * telegram_grade, but not home_probability/away_probability.
 */
export function useTopPicks(limit = 6) {
  const path = `/upcoming-matches/?quality_picks=true&client_type=frontend&limit=${limit}&sort=time&order=asc`;
  return useApiQuery<UpcomingMatchesResponse>(path);
}
