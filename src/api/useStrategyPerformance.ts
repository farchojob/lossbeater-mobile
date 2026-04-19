import { useApiQuery } from './hooks';

export type TierAccuracy = { total: number; correct: number; accuracy: number };

export type MarketAccuracy = {
  total: number;
  correct: number;
  accuracy: number;
  by_league?: Array<{
    league_id: string;
    league_name: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
};

export type GradeBucket = {
  total: number;
  correct: number;
  accuracy: number;
  roi: number;
};

export type StrategyPerformance = {
  period: { days: number; start_date: string; end_date: string };
  total_matches: number;
  markets: {
    match_winner: MarketAccuracy;
    first_set: MarketAccuracy;
    over_under: MarketAccuracy;
  };
  pick_quality: {
    top_pick: TierAccuracy;
    confident_pick: TierAccuracy;
  };
  value_bets: {
    match_winner: TierAccuracy;
    over_under: TierAccuracy;
  };
  edge_metrics?: {
    favs_wr: TierAccuracy;
    edge_picks: TierAccuracy;
    edge_roi: number;
    avg_edge_pp: number;
    upsets: TierAccuracy;
    by_tier?: Record<string, TierAccuracy>;
  };
  grade_metrics?: {
    elite: GradeBucket;
    strong: GradeBucket;
    safe: GradeBucket;
  };
  odds_buckets?: {
    heavy: TierAccuracy;
    value: TierAccuracy;
    close: TierAccuracy;
  };
};

export function useStrategyPerformance(daysBack: number) {
  return useApiQuery<StrategyPerformance>(`/strategy/performance?days_back=${daysBack}`);
}
