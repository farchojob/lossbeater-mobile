import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useApi } from './hooks';

export type FavoritesResponse = {
  players?: (string | number)[];
  leagues?: (string | number)[];
  favorites?: {
    players?: (string | number)[];
    leagues?: (string | number)[];
  };
};

type FavoritesState = {
  players: string[];
  leagues: string[];
};

const FAVORITES_KEY = '/favorites';

function normalize(raw: FavoritesResponse | undefined): FavoritesState {
  const players =
    (raw?.players ?? raw?.favorites?.players ?? []).map(String);
  const leagues =
    (raw?.leagues ?? raw?.favorites?.leagues ?? []).map(String);
  return { players, leagues };
}

/**
 * User favorites (players + leagues) with optimistic league toggle.
 * Backend: GET /favorites, POST /favorites/toggle.
 */
export function useUserFavorites() {
  const { request, isSignedIn } = useApi();
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(
    isSignedIn ? FAVORITES_KEY : null,
    { refreshInterval: 120_000 },
  );

  const state = useMemo(() => normalize(data), [data]);

  const isFavoriteLeague = useCallback(
    (id: string | number) => state.leagues.includes(String(id)),
    [state.leagues],
  );

  const isFavoritePlayer = useCallback(
    (id: string | number | null | undefined) =>
      id != null && state.players.includes(String(id)),
    [state.players],
  );

  const toggleLeague = useCallback(
    async (leagueId: string | number) => {
      const id = String(leagueId);
      const isFav = state.leagues.includes(id);
      const optimistic: FavoritesResponse = {
        players: state.players,
        leagues: isFav ? state.leagues.filter((x) => x !== id) : [...state.leagues, id],
      };
      mutate(optimistic, false);
      try {
        await request('/favorites/toggle', {
          method: 'POST',
          body: { type: 'league', id },
        });
        mutate();
      } catch {
        mutate();
      }
    },
    [state, request, mutate],
  );

  const togglePlayer = useCallback(
    async (playerId: string | number) => {
      const id = String(playerId);
      const isFav = state.players.includes(id);
      const optimistic: FavoritesResponse = {
        players: isFav ? state.players.filter((x) => x !== id) : [...state.players, id],
        leagues: state.leagues,
      };
      mutate(optimistic, false);
      try {
        await request('/favorites/toggle', {
          method: 'POST',
          body: { type: 'player', id },
        });
        mutate();
      } catch {
        mutate();
      }
    },
    [state, request, mutate],
  );

  return {
    favoritePlayers: state.players,
    favoriteLeagues: state.leagues,
    isFavoriteLeague,
    isFavoritePlayer,
    toggleLeague,
    togglePlayer,
    isLoading,
    error,
  };
}
