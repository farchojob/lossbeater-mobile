import React from 'react';
import { Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
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

const HOME_SCORES = ['3-0', '3-1', '3-2'] as const;
const AWAY_SCORES = ['0-3', '1-3', '2-3'] as const;
const ALL_SCORES = [...HOME_SCORES, ...AWAY_SCORES];

export function CorrectScoreCard({ match }: { match: Match }) {
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslations('analysis');
  const { t: tCommon } = useTranslations('common');

  const homeName = (match.home as { name?: string } | undefined)?.name ?? tCommon('home');
  const awayName = (match.away as { name?: string } | undefined)?.name ?? tCommon('away');
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const h2h = ((match.tipster_analysis ?? {}) as Record<string, any>).h2h_points_sets_analysis as
    | Record<string, any>
    | undefined;
  const sd = (h2h?.sets_distribution?.last10 ?? h2h?.sets_distribution?.all_time) as
    | Record<string, any>
    | undefined;
  const pctRaw = (sd?.distribution_percentages ?? {}) as Record<string, any>;
  const pct: Record<string, number> = {};
  for (const k of ALL_SCORES) {
    pct[k] = toNum(pctRaw[k]) ?? 0;
  }
  const total = toNum(sd?.total_matches) ?? 0;

  if (!sd || total === 0) {
    return (
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: 14,
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
          {t('cards.correctScore.title')}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center', paddingVertical: 8 }}
        >
          {t('cards.correctScore.noData')}
        </Text>
      </View>
    );
  }

  const maxScore = ALL_SCORES.reduce((best, s) => (pct[s] > pct[best] ? s : best), ALL_SCORES[0]);
  const homeWinPct = HOME_SCORES.reduce((sum, s) => sum + (pct[s] ?? 0), 0);
  const awayWinPct = AWAY_SCORES.reduce((sum, s) => sum + (pct[s] ?? 0), 0);

  const narrative = buildNarrative({
    pct,
    maxScore,
    homeWinPct,
    awayWinPct,
    shortHome,
    shortAway,
    total,
    match,
    t,
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
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
            {t('cards.correctScore.title')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.3,
            }}
          >
            {t('cards.correctScore.mostLikely')}{' '}
            <Text style={{ color: colors.primary, fontVariant: ['tabular-nums'] }}>{maxScore}</Text>
            <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 13 }}>
              {' '}
              ({pct[maxScore].toFixed(0)}%)
            </Text>
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 10, fontWeight: '800' }}
          >
            {t('cards.correctScore.dataInsights')}
          </Text>
        </View>
      </View>

      <ScoreRow
        label={shortHome}
        scores={HOME_SCORES}
        pct={pct}
        maxScore={maxScore}
        side="home"
        colors={colors}
        t={t}
      />
      <ScoreRow
        label={shortAway}
        scores={AWAY_SCORES}
        pct={pct}
        maxScore={maxScore}
        side="away"
        colors={colors}
        t={t}
      />

      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: '600',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 10,
        }}
      >
        {t('cards.correctScore.basedOn').replace('{{count}}', String(total))}
      </Text>

      {narrative && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={12} color={'#c084fc'} strokeWidth={2.4} />
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
              {t('cards.correctScore.scoreContext')}
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, fontWeight: '500' }}
          >
            {narrative}
          </Text>
        </View>
      )}
    </View>
  );
}

function ScoreRow({
  label,
  scores,
  pct,
  maxScore,
  side,
  colors,
  t,
}: {
  label: string;
  scores: readonly string[];
  pct: Record<string, number>;
  maxScore: string;
  side: 'home' | 'away';
  colors: ThemeColors;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}) {
  const sideColor = side === 'home' ? colors.primary : colors.warning;
  const maxLocal = Math.max(...scores.map((s) => pct[s] ?? 0), 1);
  return (
    <View style={{ gap: 6 }}>
      <Text
        allowFontScaling={false}
        style={{ color: sideColor, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 }}
      >
        {label} {t('cards.correctScore.wins')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {scores.map((score) => {
          const val = pct[score] ?? 0;
          const isMax = score === maxScore;
          return (
            <View
              key={score}
              style={{
                flex: 1,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isMax ? colors.primary : colors.border,
                backgroundColor: isMax ? 'rgba(59,130,246,0.08)' : colors.surfaceMuted,
                paddingVertical: 8,
                paddingHorizontal: 4,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  color: colors.textPrimary,
                  fontSize: 13,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {score}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${(val / maxLocal) * 100}%`,
                    backgroundColor: sideColor,
                    borderRadius: 2,
                  }}
                />
              </View>
              <Text
                allowFontScaling={false}
                style={{
                  color: val > 0 ? colors.textPrimary : colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {val.toFixed(0)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function buildNarrative(ctx: {
  pct: Record<string, number>;
  maxScore: string;
  homeWinPct: number;
  awayWinPct: number;
  shortHome: string;
  shortAway: string;
  total: number;
  match: Match;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): string | null {
  const { pct, maxScore, homeWinPct, awayWinPct, shortHome, shortAway, total, match, t } = ctx;
  const sentences: string[] = [];
  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;

  const maxPct = pct[maxScore] ?? 0;
  if (maxPct >= 40) {
    sentences.push(
      fill(t('cards.correctScore.narrative.clearFavorite'), {
        score: maxScore,
        pct: maxPct.toFixed(0),
      }),
    );
  } else if (maxPct >= 25) {
    sentences.push(
      fill(t('cards.correctScore.narrative.mostCommon'), {
        score: maxScore,
        pct: maxPct.toFixed(0),
      }),
    );
  } else {
    sentences.push(
      fill(t('cards.correctScore.narrative.noDominant'), {
        score: maxScore,
        pct: maxPct.toFixed(0),
      }),
    );
  }

  if (Math.abs(homeWinPct - awayWinPct) >= 20) {
    const dominant = homeWinPct > awayWinPct ? shortHome : shortAway;
    const dominantPct = Math.max(homeWinPct, awayWinPct);
    sentences.push(
      fill(t('cards.correctScore.narrative.dominance'), {
        player: dominant,
        pct: dominantPct.toFixed(0),
      }),
    );
  } else {
    sentences.push(
      fill(t('cards.correctScore.narrative.evenSplit'), {
        home: shortHome,
        homePct: homeWinPct.toFixed(0),
        away: shortAway,
        awayPct: awayWinPct.toFixed(0),
      }),
    );
  }

  const sweepPct = (pct['3-0'] ?? 0) + (pct['0-3'] ?? 0);
  const fiveSetPct = (pct['3-2'] ?? 0) + (pct['2-3'] ?? 0);
  if (sweepPct >= 40) {
    sentences.push(
      fill(t('cards.correctScore.narrative.sweepsHigh'), { pct: sweepPct.toFixed(0) }),
    );
  } else if (fiveSetPct >= 35) {
    sentences.push(
      fill(t('cards.correctScore.narrative.fiveSetHigh'), { pct: fiveSetPct.toFixed(0) }),
    );
  }

  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal >= 5 && total < h2hTotal) {
    sentences.push(
      fill(t('cards.correctScore.narrative.sampleNote'), {
        total: String(total),
        h2hTotal: String(h2hTotal),
      }),
    );
  }

  return sentences.length === 0 ? null : sentences.join(' ');
}

function fill(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
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
