import type { UpcomingMatch } from '../api/types';
import type { LiveMatch } from '../api/useLiveMatches';
import type { Tier } from '../api/useSubscription';

export type RibbonColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'amber'
  | 'emerald'
  | 'cyan'
  | 'yellow'
  | 'orange'
  | 'purple';

export type RibbonInfo = {
  label: string;
  color: RibbonColor;
};

type MatchLike = UpcomingMatch | LiveMatch;

const EDGE_PICK_TIER_COLORS: Record<string, RibbonColor> = {
  UPSET: 'red',
  HOT: 'orange',
  LOCK: 'emerald',
  H2H: 'purple',
  ROLE: 'purple',
};

export function getMatchRibbon(
  match: MatchLike,
  hasAccess: (tier: Tier) => boolean,
): RibbonInfo | null {
  const m = match as Record<string, unknown>;
  const consolidated = (m.consolidatedPredictions ?? {}) as Record<string, unknown>;
  const mw = (consolidated.matchWinner ?? {}) as Record<string, unknown>;
  const summary = (consolidated.summary ?? {}) as Record<string, unknown>;

  const edgeRibbon = resolveEdgePickRibbon(match, summary);
  if (edgeRibbon) return edgeRibbon;

  const recBet = (mw.recommendedBet ?? {}) as Record<string, unknown>;
  const favored = getFavoredSide(match);

  if (recBet.hasRecommendation && recBet.level === 'FIXA') {
    return { label: `Fixa ${favored}`, color: 'red' };
  }

  const pickQuality = summary.pickQuality as Record<string, unknown> | undefined;
  if (pickQuality && hasAccess('pro')) {
    // V3 tiers: confirm = chalk multi-signal align (green), contradict = dog with explicit argument (amber)
    if (pickQuality.tier === 'confirm') {
      return { label: `Confirm ${favored}`, color: 'green' };
    }
    if (pickQuality.tier === 'contradict') {
      return { label: `Contra. ${favored}`, color: 'amber' };
    }
    if (pickQuality.tier === 'top') {
      return { label: `Top ${favored}`, color: 'green' };
    }
    const homeProb = numberOf(mw.home_probability) ?? 50;
    const awayProb = numberOf(mw.away_probability) ?? 50;
    const spread = Math.abs(homeProb - awayProb);
    const favOdds = Math.min(
      numberOf((m.odds as Record<string, unknown> | undefined)?.home_od) ?? 99,
      numberOf((m.odds as Record<string, unknown> | undefined)?.away_od) ?? 99,
    );
    const hasOdds = favOdds < 50;
    const confOddsOk = !hasOdds || (favOdds >= 1.35 && favOdds <= 1.65);
    if (pickQuality.tier === 'confident' && spread >= 30 && confOddsOk) {
      return { label: `Conf. ${favored}`, color: 'blue' };
    }
  }

  if (recBet.hasRecommendation && recBet.level === 'STRONG') {
    return { label: `Strong ${favored}`, color: 'blue' };
  }

  if (hasAccess('plus')) {
    const vbArr = summary.valueBets as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(vbArr)) {
      const mwVb = vbArr.find(
        (v) =>
          v?.marketType === 'matchWinner' &&
          v?.isValueBet === true &&
          v?.type !== 'smart_underdog' &&
          (numberOf(v?.edge) ?? 0) >= 5,
      );
      if (mwVb) {
        const side =
          mwVb.recommendedSide === 'away'
            ? shortName(((m.away as Record<string, unknown>)?.name as string) || 'Away')
            : shortName(((m.home as Record<string, unknown>)?.name as string) || 'Home');
        return { label: `Val. ${side}`, color: 'amber' };
      }
    }
  }

  return null;
}

function resolveEdgePickRibbon(
  match: MatchLike,
  summary: Record<string, unknown>,
): RibbonInfo | null {
  const edgePick = summary.edgePick as Record<string, unknown> | undefined;
  const tier = edgePick?.tier as string | undefined;
  if (!tier || !EDGE_PICK_TIER_COLORS[tier]) return null;
  const m = match as Record<string, unknown>;
  const side = edgePick?.side;
  const playerName =
    side === 'home'
      ? shortName(((m.home as Record<string, unknown>)?.name as string) || 'Home')
      : shortName(((m.away as Record<string, unknown>)?.name as string) || 'Away');
  return { label: `${tier} ${playerName}`, color: EDGE_PICK_TIER_COLORS[tier] };
}

function getFavoredSide(match: MatchLike): string {
  const m = match as Record<string, unknown>;
  const mw = ((m.consolidatedPredictions as Record<string, unknown>)?.matchWinner ??
    {}) as Record<string, unknown>;
  const recBet = (mw.recommendedBet ?? {}) as Record<string, unknown>;
  const recSide =
    (recBet.recommendedPlayer as string | undefined) ??
    (recBet.recommendedSide as string | undefined) ??
    (recBet.recommendedPick as string | undefined);
  const homeName = ((m.home as Record<string, unknown>)?.name as string) || 'Home';
  const awayName = ((m.away as Record<string, unknown>)?.name as string) || 'Away';
  if (recSide === 'home' || recSide === 'home_win') return shortName(homeName);
  if (recSide === 'away' || recSide === 'away_win') return shortName(awayName);
  if (recBet.type === 'home_win') return shortName(homeName);
  if (recBet.type === 'away_win') return shortName(awayName);
  const homeProb = numberOf(mw.home_probability) ?? 50;
  const awayProb = numberOf(mw.away_probability) ?? 50;
  if (homeProb > awayProb) return shortName(homeName);
  if (awayProb > homeProb) return shortName(awayName);
  return 'Pick';
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function numberOf(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
