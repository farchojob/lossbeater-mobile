/**
 * Fixed league display order — top leagues sorted by daily match volume.
 * Mirrors tipster-ai/lib/constants/league-order.ts so mobile + desktop stay aligned.
 * Favorites are sorted above this order when applicable.
 */
export const LEAGUE_SORT_ORDER: Record<string, number> = {
  '22307': 1, // Setka Cup
  '29128': 2, // TT Elite Series
  '22742': 3, // Czech Liga Pro
  '29097': 4, // TT Cup
  '22121': 5, // Setka Cup Women
  '25065': 6, // Challenger Series TT
};

export function getLeagueSortKey(leagueId: string | number): number {
  return LEAGUE_SORT_ORDER[String(leagueId)] ?? 99;
}
