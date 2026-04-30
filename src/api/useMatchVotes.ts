import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from './hooks';

export type VoteStats = {
  totalVotes: number;
  homeVotes: number;
  awayVotes: number;
  homePercentage: number;
  awayPercentage: number;
};

export type MatchVotesResponse = {
  success: boolean;
  stats: VoteStats;
  userVote: 'home' | 'away' | null;
  matchFinished: boolean;
  winner: 'home' | 'away' | null;
};

type CastResponse = {
  success: boolean;
  stats: VoteStats;
  prediction: 'home' | 'away';
  matchFinished?: boolean;
  winner?: 'home' | 'away' | null;
};

/**
 * Fetch + mutate voting state for a single match.
 * Polling-based (no websocket). Happy-path only — errors surface as `error`.
 */
export function useMatchVotes(matchId: string | null | undefined, matchTime?: number | null) {
  const { request, isSignedIn } = useApi();
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [userVote, setUserVote] = useState<'home' | 'away' | null>(null);
  const [matchFinished, setMatchFinished] = useState(false);
  const [winner, setWinner] = useState<'home' | 'away' | null>(null);
  const [loading, setLoading] = useState(false);
  const [casting, setCasting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const tick = useRef(0);

  const refetch = useCallback(async () => {
    if (!matchId || !isSignedIn) return;
    const ticket = ++tick.current;
    setLoading(true);
    setError(null);
    try {
      const res = await request<MatchVotesResponse>(`/matches/${matchId}/votes`);
      if (ticket !== tick.current) return;
      setStats(res.stats ?? null);
      setUserVote(res.userVote ?? null);
      setMatchFinished(Boolean(res.matchFinished));
      setWinner(res.winner ?? null);
    } catch (e) {
      if (ticket === tick.current) setError(e as Error);
    } finally {
      if (ticket === tick.current) setLoading(false);
    }
  }, [matchId, isSignedIn, request]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const castVote = useCallback(
    async (prediction: 'home' | 'away') => {
      if (!matchId || casting) return;
      setCasting(true);
      setError(null);
      try {
        const res = await request<CastResponse>(`/matches/${matchId}/vote`, {
          method: 'POST',
          body: { prediction, match_time: matchTime },
        });
        setStats(res.stats);
        setUserVote(res.prediction);
      } catch (e) {
        setError(e as Error);
        throw e;
      } finally {
        setCasting(false);
      }
    },
    [matchId, matchTime, casting, request],
  );

  const clearVote = useCallback(async () => {
    if (!matchId || casting) return;
    setCasting(true);
    setError(null);
    try {
      const res = await request<{ success: boolean; stats: VoteStats }>(
        `/matches/${matchId}/vote`,
        { method: 'DELETE' },
      );
      setStats(res.stats);
      setUserVote(null);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setCasting(false);
    }
  }, [matchId, casting, request]);

  return {
    stats,
    userVote,
    matchFinished,
    winner,
    loading,
    casting,
    error,
    refetch,
    castVote,
    clearVote,
  };
}
