import { useApiQuery } from './hooks';

export type MostVotedEntry = {
  match: {
    id: string;
    home: { id: string; name: string };
    away: { id: string; name: string };
    league: { id: string; name: string };
    time: string;
  };
  voteStats: {
    totalVotes: number;
    homeVotes: number;
    awayVotes: number;
    homePercentage: number;
    awayPercentage: number;
  };
};

export type MostVotedResponse = {
  success?: boolean;
  matches?: MostVotedEntry[];
  count?: number;
};

/**
 * Community voting tendencies — matches ranked by total votes cast.
 */
export function useMostVoted(limit = 20, minVotes = 1) {
  const path = `/matches/most-voted?limit=${limit}&min_votes=${minVotes}`;
  return useApiQuery<MostVotedResponse>(path);
}
