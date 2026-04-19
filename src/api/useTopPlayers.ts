import { useApiQuery } from './hooks';

export type PlayerOfDayMatch = {
  match_id: string;
  ss?: string;
  league?: { id?: string | number; name?: string };
  opponent?: { id?: string | number; name?: string };
  is_home?: boolean;
  won?: boolean;
  player_score?: number;
  opponent_score?: number;
  time?: string | number;
};

export type PlayerOfDay = {
  player_id: string;
  player_name: string;
  matches: PlayerOfDayMatch[];
  wins: number;
  total_matches: number;
  win_rate: number;
};

export type PlayersOfDayResponse = {
  success?: boolean;
  players?: PlayerOfDay[];
};

/**
 * Today's hot players feed — same backend endpoint as the web `usePlayersOfDay`.
 */
export function useTopPlayers(limit = 20, minMatches = 2) {
  const path = `/players/players-of-day?limit=${limit}&min_matches=${minMatches}`;
  return useApiQuery<PlayersOfDayResponse>(path);
}
