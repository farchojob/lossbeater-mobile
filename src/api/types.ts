/**
 * Shape of `GET /api/v1/me` responses. Backend fields are permissive —
 * only the pieces we render are typed; the rest falls through as unknown.
 */
export type MeResponse = {
  userId: string;
  email?: string | null;
  displayName?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  language?: string | null;
  timezone?: string | null;
  entitlements?: {
    tier?: 'free' | 'plus' | 'pro' | string | null;
    plan?: string | null;
    status?: 'active' | 'trial' | 'expired' | 'canceled' | 'none' | 'past_due' | 'inactive' | string | null;
    expiresAt?: string | null;
    trialUsed?: boolean;
    features?: Record<string, boolean> | null;
  } | null;
  coins?: {
    balance?: number;
    totalEarned?: number;
    totalSpent?: number;
  } | null;
  voting?: {
    totalVotes?: number;
  } | null;
  [extra: string]: unknown;
};

/** Upcoming match payload surfaced on the home feed. */
export type UpcomingMatch = {
  id: string;
  time: string;
  league?: {
    id?: string | number;
    name?: string;
    country?: string;
  } | null;
  home?: { id?: string | number; name?: string; image_id?: string | number } | null;
  away?: { id?: string | number; name?: string; image_id?: string | number } | null;
  odds?: {
    matchWinner?: {
      home_od?: string | number | null;
      away_od?: string | number | null;
      favorite?: 'home' | 'away' | string | null;
    } | null;
    handicap?: {
      home_od?: string | number | null;
      away_od?: string | number | null;
      handicap?: string | number | null;
    } | null;
    overUnder?: {
      over_od?: string | number | null;
      under_od?: string | number | null;
      handicap?: string | number | null;
    } | null;
    firstSet?: {
      home_od?: string | number | null;
      away_od?: string | number | null;
    } | null;
  } | null;
  consolidatedPredictions?: {
    matchWinner?: {
      home_probability?: number | null;
      away_probability?: number | null;
    } | null;
    firstSet?: {
      home_probability?: number | null;
      away_probability?: number | null;
      confidence?: string | null;
    } | null;
    overUnder?: {
      over_probability?: number | null;
      under_probability?: number | null;
      line?: string | number | null;
    } | null;
    summary?: {
      pickQuality?: PickQuality | null;
      valueBet?: unknown;
    } | null;
  } | null;
  h2h_sets_analysis?: {
    first_set_analysis?: Record<
      string,
      {
        home_win_rate?: number | null;
        away_win_rate?: number | null;
        matches_analyzed?: number | null;
      } | null
    > | null;
    total_points_analysis?: Record<
      string,
      {
        matches_analyzed?: number | null;
        avg_total_points?: number | null;
        home_avg_points?: number | null;
        away_avg_points?: number | null;
      } | null
    > | null;
  } | null;
};

export type PickQuality = {
  tier?: 'top' | 'confident' | 'value' | string | null;
  label?: string | null;
  reasons?: string[];
  telegram_eligible?: boolean;
  telegram_grade?: 'elite' | 'strong' | 'safe' | string | null;
  filters?: {
    spread?: number;
    fav_odds?: number;
    dog_odds?: number;
    picked_odds?: number;
    agrees_with_market?: boolean;
    consensus?: number;
    total_signals?: number;
    contradicts_market?: boolean;
    points_margin?: number;
    home_points?: number;
    away_points?: number;
  } | null;
};

export type UpcomingMatchesResponse = {
  success?: boolean;
  data?: UpcomingMatch[];
  count?: number;
  total_count?: number | null;
};
