import React from 'react';
import { Text, View } from 'react-native';
import {
  BarChart3,
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import type { AnyMatch } from '../../../api/useMatchById';

type Match = Record<string, unknown> & AnyMatch;

type ThemeColors = {
  primary: string;
  warning: string;
  success: string;
  danger: string;
  border: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textMuted: string;
};

interface Factor {
  Icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  color: string;
}

export function MatchWinnerCard({ match }: { match: Match }) {
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslations('analysis');
  const { t: tPatterns } = useTranslations('playerInsights');
  const { t: tCommon } = useTranslations('common');

  const homeName =
    (match.home as { name?: string } | undefined)?.name ?? tCommon('home');
  const awayName =
    (match.away as { name?: string } | undefined)?.name ?? tCommon('away');
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const cp = (match.consolidatedPredictions ?? {}) as Record<string, any>;
  const mwData = (cp.matchWinner ?? {}) as Record<string, any>;
  const oddsRoot = (match.odds ?? {}) as Record<string, any>;
  const mwOdds = (oddsRoot.matchWinner ?? {}) as Record<string, any>;

  const mwHomePct = toNum(mwData.home_probability) ?? 50;
  const mwFavHome = mwHomePct >= 50;
  const displayProb = mwFavHome ? mwHomePct : 100 - mwHomePct;
  const displayName = mwFavHome ? shortHome : shortAway;

  const homeOdds = toNum(mwData.home_od_float ?? mwOdds.home_od);
  const awayOdds = toNum(mwData.away_od_float ?? mwOdds.away_od);

  const narrative = buildNarrative(match, {
    shortHome,
    shortAway,
    mwFavHome,
    displayProb,
    displayName,
    t,
  });
  const factors = buildKeyFactors(match, {
    shortHome,
    shortAway,
    mwFavHome,
    homeOdds,
    awayOdds,
    colors,
    t,
    tPatterns,
  });

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 14,
        gap: 14,
      }}
    >
      {narrative && (
        <View style={{ gap: 6 }}>
          <SectionHeader
            Icon={Sparkles}
            label={t('cards.matchWinner.matchContext')}
            color={'#c084fc'}
            muted={colors.textMuted}
          />
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 12,
              lineHeight: 18,
              fontWeight: '500',
            }}
          >
            {narrative}
          </Text>
        </View>
      )}

      <View style={{ gap: 6 }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {t('cards.matchWinner.title')}
        </Text>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.3,
          }}
        >
          <Text style={{ fontVariant: ['tabular-nums'] }}>{Math.round(displayProb)}%</Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>  {displayName}</Text>
        </Text>

        <OddsBar
          homePct={mwHomePct}
          homeOdds={homeOdds}
          awayOdds={awayOdds}
          homeLabel={shortHome}
          awayLabel={shortAway}
          colors={colors}
        />
      </View>

      {factors.length > 0 && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 12,
            gap: 8,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {t('cards.matchWinner.keyFactors')}
          </Text>
          {factors.map((f, i) => (
            <FactorRow key={`${f.label}-${i}`} factor={f} muted={colors.textMuted} />
          ))}
        </View>
      )}
    </View>
  );
}

function SectionHeader({
  Icon,
  label,
  color,
  muted,
}: {
  Icon: LucideIcon;
  label: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon size={12} color={color} strokeWidth={2.4} />
      <Text
        allowFontScaling={false}
        style={{
          color: muted,
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function FactorRow({ factor, muted }: { factor: Factor; muted: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <factor.Icon size={13} color={factor.color} strokeWidth={2.4} style={{ marginTop: 1 }} />
      <Text
        allowFontScaling={false}
        style={{ flex: 1, fontSize: 12, lineHeight: 17, color: muted, fontWeight: '600' }}
      >
        <Text style={{ color: muted, fontWeight: '700' }}>{factor.label}: </Text>
        {typeof factor.value === 'string' ? (
          <Text style={{ color: factor.color, fontWeight: '600' }}>{factor.value}</Text>
        ) : (
          factor.value
        )}
      </Text>
    </View>
  );
}

function OddsAtValue({
  odds,
  bucket,
  wr,
  implied,
  wins,
  matches,
  muted,
  t,
}: {
  odds: number;
  bucket: string;
  wr: number;
  implied: number;
  wins?: number;
  matches?: number;
  muted: string;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}) {
  const diff = wr - implied;
  const wrCol = wrColor(wr);
  const diffCol = diff > 0 ? '#10b981' : '#ef4444';
  return (
    <>
      <Text style={{ color: muted, fontVariant: ['tabular-nums'] }}>@{odds.toFixed(2)} </Text>
      <Text style={{ color: muted, opacity: 0.6 }}>({bucket}) </Text>
      <Text style={{ color: muted }}>{t('cards.matchWinner.wins')} </Text>
      <Text style={{ color: wrCol, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
        {Math.round(wr)}%
      </Text>
      {wins != null && matches != null && (
        <Text style={{ color: muted, opacity: 0.6, fontVariant: ['tabular-nums'] }}>
          {' '}({wins}/{matches})
        </Text>
      )}
      {implied > 0 && Math.abs(diff) >= 1 && (
        <>
          <Text style={{ color: muted, opacity: 0.5 }}> · </Text>
          <Text style={{ color: muted }}>
            {t('cards.matchWinner.implied')}{' '}
            <Text style={{ fontVariant: ['tabular-nums'] }}>{Math.round(implied)}%</Text>{' '}
          </Text>
          <Text style={{ color: diffCol, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
            ({diff > 0 ? '+' : ''}
            {Math.round(diff)}%)
          </Text>
        </>
      )}
    </>
  );
}

function OddsBar({
  homePct,
  homeOdds,
  awayOdds,
  homeLabel,
  awayLabel,
  colors,
}: {
  homePct: number;
  homeOdds: number | null;
  awayOdds: number | null;
  homeLabel: string;
  awayLabel: string;
  colors: ThemeColors;
}) {
  const awayPct = 100 - homePct;
  return (
    <View style={{ gap: 6, paddingTop: 2 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text
          allowFontScaling={false}
          style={{
            color: homeOdds != null ? colors.primary : colors.textMuted,
            fontSize: 13,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {homeOdds != null ? homeOdds.toFixed(2) : `${Math.round(homePct)}%`}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: awayOdds != null ? colors.warning : colors.textMuted,
            fontSize: 13,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {awayOdds != null ? awayOdds.toFixed(2) : `${Math.round(awayPct)}%`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <View style={{ flex: homePct, backgroundColor: colors.primary }} />
        <View style={{ flex: awayPct, backgroundColor: colors.warning }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', maxWidth: '48%' }}
        >
          {homeLabel}
        </Text>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: '600',
            maxWidth: '48%',
            textAlign: 'right',
          }}
        >
          {awayLabel}
        </Text>
      </View>
    </View>
  );
}

function buildKeyFactors(
  match: Match,
  ctx: {
    shortHome: string;
    shortAway: string;
    mwFavHome: boolean;
    homeOdds: number | null;
    awayOdds: number | null;
    colors: ThemeColors;
    t: (key: string, opts?: { defaultValue?: string }) => string;
    tPatterns: (key: string, opts?: { defaultValue?: string }) => string;
  },
): Factor[] {
  const { shortHome, shortAway, mwFavHome, homeOdds, awayOdds, colors, t, tPatterns } = ctx;
  const factors: Factor[] = [];

  const form = (match.form ?? {}) as Record<string, any>;
  const homeForm = form.home as Record<string, any> | undefined;
  const awayForm = form.away as Record<string, any> | undefined;
  if (homeForm || awayForm) {
    const homeWR = toNum(homeForm?.win_rate) ?? 0;
    const awayWR = toNum(awayForm?.win_rate) ?? 0;
    const homeW = toNum(homeForm?.wins) ?? 0;
    const homeL = toNum(homeForm?.losses) ?? 0;
    const awayW = toNum(awayForm?.wins) ?? 0;
    const awayL = toNum(awayForm?.losses) ?? 0;
    const favWR = mwFavHome ? homeWR : awayWR;
    const wLbl = t('cards.matchWinner.winsLabel', { defaultValue: 'W' });
    const lLbl = t('cards.matchWinner.lossLabel', { defaultValue: 'L' });
    factors.push({
      Icon: TrendingUp,
      label: t('cards.matchWinner.form'),
      value: `${shortHome} ${Math.round(homeWR)}% (${homeW}${wLbl}-${homeL}${lLbl}) vs ${shortAway} ${Math.round(awayWR)}% (${awayW}${wLbl}-${awayL}${lLbl})`,
      color: favWR >= 70 ? colors.success : favWR >= 50 ? colors.textPrimary : colors.warning,
    });
  }

  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;
  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal > 0) {
    const homeWins = toNum(h2h.home_wins) ?? 0;
    const awayWins = toNum(h2h.away_wins) ?? 0;
    const display = typeof h2h.display === 'string' ? h2h.display : `${homeWins}-${awayWins}`;
    const dominant = homeWins > awayWins ? shortHome : awayWins > homeWins ? shortAway : null;
    const suffix = dominant
      ? ` — ${dominant} ${t('cards.matchWinner.leads')}`
      : ` — ${t('cards.matchWinner.even')}`;
    factors.push({
      Icon: Users,
      label: t('cards.matchWinner.h2h'),
      value: `${display} (${h2hTotal} ${t('cards.matchWinner.matches')})${suffix}`,
      color: Math.abs(homeWins - awayWins) >= 3 ? colors.success : colors.textPrimary,
    });
  }

  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;
  const alignment = ((ta.comparison ?? {}) as Record<string, any>).alignment as
    | Record<string, string>
    | undefined;
  if (alignment?.market_ml) {
    const allAligned =
      alignment.market_ml === 'aligned' && alignment.market_stats === 'aligned';
    factors.push({
      Icon: BarChart3,
      label: t('cards.matchWinner.signals'),
      value: allAligned
        ? t('cards.matchWinner.marketAligned')
        : alignment.market_ml === 'aligned'
          ? t('cards.matchWinner.marketAiAgree')
          : t('cards.matchWinner.marketAiDisagree'),
      color: allAligned
        ? colors.success
        : alignment.market_ml === 'aligned'
          ? colors.textPrimary
          : colors.warning,
    });
  }

  const benchmarks = mwOf(match)?.home_benchmarks as Record<string, any> | undefined;
  const g2 = benchmarks?.glicko2_experiment as Record<string, any> | undefined;
  const g2Gate = benchmarks?.g2_confidence_gate as Record<string, any> | undefined;
  if (g2) {
    const homeRating = toNum(g2.home_rating) ?? 0;
    const awayRating = toNum(g2.away_rating) ?? 0;
    const spread = Math.abs(homeRating - awayRating);
    const stronger = homeRating > awayRating ? shortHome : shortAway;
    const agrees = g2Gate?.g2_agrees === true;
    factors.push({
      Icon: Brain,
      label: t('cards.matchWinner.rating'),
      value: `${stronger} +${Math.round(spread)} pts — ${agrees ? t('cards.matchWinner.agreesWithAi') : t('cards.matchWinner.disagreesWithAi')}`,
      color: agrees ? colors.success : colors.warning,
    });
  }

  const oddsBuckets = (ta.odds_buckets_analysis ?? {}) as Record<string, any>;
  const coa = (oddsBuckets.current_odds_analysis ?? {}) as Record<string, any>;
  const ps = (match.player_stats ?? {}) as Record<string, any>;

  for (const [side, od, name] of [
    ['home', homeOdds, shortHome] as const,
    ['away', awayOdds, shortAway] as const,
  ]) {
    if (od == null || od <= 0) continue;
    const coaSide = coa[side] as Record<string, any> | undefined;
    let wr: number | null = null;
    let implied = 0;
    let bucket = '';
    let wins: number | undefined;
    let matches: number | undefined;

    if (coaSide && coaSide.historical_win_rate != null) {
      wr = toNum(coaSide.historical_win_rate);
      implied = toNum(coaSide.implied_probability) ?? 0;
      bucket = (coaSide.odds_bucket as string) ?? '';
      const perf = ((oddsBuckets[side] as Record<string, any>)?.current_odds_performance ?? {}) as Record<string, any>;
      wins = toNum(perf.wins) ?? undefined;
      matches = toNum(perf.matches) ?? undefined;
    } else {
      const temporal = ps[side]?.temporal as Record<string, any> | undefined;
      const rangesL10 = (temporal?.last10 as Record<string, any>)?.oddsBuckets as Record<string, any> | undefined;
      const rangesL20 = (temporal?.last20 as Record<string, any>)?.oddsBuckets as Record<string, any> | undefined;
      const rangesMap =
        (rangesL10?.ranges as Record<string, any> | undefined) ??
        (rangesL20?.ranges as Record<string, any> | undefined);
      bucket = getOddsRange(od);
      const bucketData = rangesMap?.[bucket] as Record<string, any> | undefined;
      implied = (1 / od) * 100;
      const bWR = toNum(bucketData?.winRate);
      const bMatches = toNum(bucketData?.matches);
      if (bWR != null && bMatches != null && bMatches > 0) {
        wr = bWR;
        wins = toNum(bucketData?.wins) ?? undefined;
        matches = bMatches;
      }
    }

    if (wr == null) continue;
    factors.push({
      Icon: BarChart3,
      label: name,
      color: colors.textPrimary,
      value: (
        <OddsAtValue
          odds={od}
          bucket={bucket}
          wr={wr}
          implied={implied}
          wins={wins}
          matches={matches}
          muted={colors.textMuted}
          t={t}
        />
      ),
    });
  }

  for (const [side, name] of [['home', shortHome], ['away', shortAway]] as const) {
    const intelligence = ps[side] as Record<string, any> | undefined;
    const patterns = intelligence?.behaviorPatterns;
    if (!Array.isArray(patterns)) continue;
    const top = (patterns as Array<Record<string, any>>)
      .filter((p) => p && typeof p.confidence === 'number' && p.confidence >= 0.6)
      .slice(0, 4);
    for (const p of top) {
      const id = p.id as string | undefined;
      if (!id) continue;
      let label = '';
      try {
        label = tPatterns(`patterns.${id}`, { defaultValue: '' }) || '';
      } catch {
        label = '';
      }
      if (!label) label = (p.label as string) || id;
      label = label.replace('{player}', name);
      const data = (p.data ?? {}) as Record<string, unknown>;
      for (const [k, v] of Object.entries(data)) {
        label = label.replaceAll(`{${k}}`, String(v ?? ''));
      }
      const cleaned = label.replace(`${name} `, '');
      const isNegative = [
        'fav_unreliable',
        'weak_dog',
        'choke_artist',
        'volatile',
        'upset_prone_heavy_fav',
        'slow_starter',
      ].includes(id);
      factors.push({
        Icon: Zap,
        label: name,
        value: cleaned,
        color: isNegative ? colors.warning : colors.success,
      });
    }
  }

  return factors;
}

function buildNarrative(
  match: Match,
  ctx: {
    shortHome: string;
    shortAway: string;
    mwFavHome: boolean;
    displayProb: number;
    displayName: string;
    t: (key: string, opts?: { defaultValue?: string }) => string;
  },
): string | null {
  const { shortHome, shortAway, mwFavHome, displayProb, displayName, t } = ctx;
  const dogName = mwFavHome ? shortAway : shortHome;
  const sentences: string[] = [];

  const openingKey =
    displayProb >= 70
      ? 'narrativeStronglyFavors'
      : displayProb >= 60
        ? 'narrativeModeratelyFavors'
        : 'narrativeSlightlyFavors';
  sentences.push(
    fill(t(`cards.matchWinner.${openingKey}`), {
      name: displayName,
      prob: Math.round(displayProb).toString(),
    }),
  );

  const form = (match.form ?? {}) as Record<string, any>;
  const favForm = mwFavHome ? form.home : form.away;
  const dogForm = mwFavHome ? form.away : form.home;
  if (favForm && dogForm) {
    const favWR = toNum(favForm.win_rate) ?? 0;
    const dogWR = toNum(dogForm.win_rate) ?? 0;
    if (favWR >= 80) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeExcellentForm'), {
          name: displayName,
          wr: Math.round(favWR).toString(),
        }),
      );
    } else if (favWR >= 60) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeSolidForm'), {
          name: displayName,
          wr: Math.round(favWR).toString(),
        }),
      );
    }
    if (dogWR >= 70) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeDogCompetitive'), {
          name: dogName,
          wr: Math.round(dogWR).toString(),
        }),
      );
    } else if (dogWR <= 40) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeDogStruggling'), {
          name: dogName,
          wr: Math.round(dogWR).toString(),
        }),
      );
    }
  }

  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;
  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal >= 3) {
    const homeWins = toNum(h2h.home_wins) ?? 0;
    const awayWins = toNum(h2h.away_wins) ?? 0;
    const favWins = mwFavHome ? homeWins : awayWins;
    const dogWins = mwFavHome ? awayWins : homeWins;
    if (favWins > dogWins) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeH2HSupports'), {
          fav: displayName,
          favW: String(favWins),
          dogW: String(dogWins),
          total: String(h2hTotal),
        }),
      );
    } else if (dogWins > favWins) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeH2HDogLeads'), {
          dog: dogName,
          dogW: String(dogWins),
          favW: String(favWins),
        }),
      );
    } else {
      sentences.push(
        fill(t('cards.matchWinner.narrativeH2HEvenly'), {
          favW: String(favWins),
          dogW: String(dogWins),
        }),
      );
    }
  }

  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;
  const alignment = ((ta.comparison ?? {}) as Record<string, any>).alignment as
    | Record<string, string>
    | undefined;
  if (alignment?.market_ml === 'aligned' && alignment.market_stats === 'aligned') {
    sentences.push(t('cards.matchWinner.narrativeAllAligned'));
  } else if (alignment && alignment.market_ml !== 'aligned') {
    sentences.push(t('cards.matchWinner.narrativeMarketDisagrees'));
  }

  const benchmarks = mwOf(match)?.home_benchmarks as Record<string, any> | undefined;
  const g2 = benchmarks?.glicko2_experiment as Record<string, any> | undefined;
  if (g2) {
    const homeRating = toNum(g2.home_rating) ?? 0;
    const awayRating = toNum(g2.away_rating) ?? 0;
    const favRating = mwFavHome ? homeRating : awayRating;
    const dogRating = mwFavHome ? awayRating : homeRating;
    if (favRating > dogRating + 80) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeG2Strongly'), {
          name: displayName,
          spread: Math.round(favRating - dogRating).toString(),
        }),
      );
    } else if (dogRating > favRating) {
      sentences.push(
        fill(t('cards.matchWinner.narrativeG2DogFavored'), { name: dogName }),
      );
    }
  }

  return sentences.length <= 1 ? null : sentences.join(' ');
}

function mwOf(match: Match): Record<string, any> | undefined {
  const cp = match.consolidatedPredictions as Record<string, any> | undefined;
  return cp?.matchWinner as Record<string, any> | undefined;
}

function fill(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}

function wrColor(wr: number): string {
  if (wr >= 65) return '#10b981';
  if (wr >= 50) return '#e5e7eb';
  if (wr >= 40) return '#f59e0b';
  return '#ef4444';
}

function getOddsRange(odds: number): string {
  if (odds <= 1.5) return '<=1.50';
  if (odds <= 1.8) return '1.50-1.80';
  if (odds <= 2.0) return '1.80-2.00';
  if (odds <= 2.2) return '2.00-2.20';
  if (odds <= 2.5) return '2.20-2.50';
  return '>2.50';
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function shortName(name: string): string {
  const cleaned = name.trim().replace(/\s+\d+$/, '').replace(/\s+\((Jr|Sr|II|III)\)$/i, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return cleaned;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}
