import React from 'react';
import { Text, View } from 'react-native';
import { BarChart3, Sparkles, TrendingUp } from 'lucide-react-native';
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
  value: string;
  color: string;
}

const POINT_BUCKETS: { key: string; label: string }[] = [
  { key: 'under_60', label: '<60' },
  { key: '60_70', label: '60-70' },
  { key: '70_80', label: '70-80' },
  { key: '80_90', label: '80-90' },
  { key: 'over_90', label: '90+' },
];

export function OverUnderCard({ match }: { match: Match }) {
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslations('analysis');
  const { t: tCommon } = useTranslations('common');

  const homeName = (match.home as { name?: string } | undefined)?.name ?? tCommon('home');
  const awayName = (match.away as { name?: string } | undefined)?.name ?? tCommon('away');
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const cp = (match.consolidatedPredictions ?? {}) as Record<string, any>;
  const ou = (cp.overUnder ?? {}) as Record<string, any>;
  const odds = ((match.odds ?? {}) as Record<string, any>).overUnder as
    | Record<string, any>
    | undefined;

  const line = toNum(ou.line);
  const overProb = toNum(ou.over_probability) ?? 50;
  const underProb = toNum(ou.under_probability) ?? 50;
  const isValue = (ou.valueBet ?? {}).isValueBet === true;
  const favoredSide: 'over' | 'under' = overProb >= underProb ? 'over' : 'under';
  const favoredLabel = favoredSide === 'over' ? t('cards.overUnder.over') : t('cards.overUnder.under');

  const h2h = ((match.tipster_analysis ?? {}) as Record<string, any>).h2h_points_sets_analysis as
    | Record<string, any>
    | undefined;
  const tp = (h2h?.total_points_analysis?.last10 ?? h2h?.total_points_analysis?.all_time) as
    | Record<string, any>
    | undefined;

  const factors = buildFactors({ tp, line, shortHome, shortAway, favoredSide, colors, t });
  const narrative = buildNarrative({ tp, line, shortHome, shortAway, favoredSide, overProb, t });

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
            {t('cards.overUnder.title')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.3,
            }}
          >
            <Text>{favoredLabel} </Text>
            <Text style={{ fontVariant: ['tabular-nums'] }}>{line != null ? line : '?'}</Text>
            <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>
              {'  '}
              {t('cards.overUnder.pts')}
            </Text>
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: isValue ? 'rgba(16,185,129,0.3)' : colors.border,
            backgroundColor: isValue ? 'rgba(16,185,129,0.12)' : colors.surfaceMuted,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: isValue ? colors.success : colors.textMuted,
              fontSize: 10,
              fontWeight: '800',
            }}
          >
            {isValue ? t('cards.overUnder.valueBet') : t('cards.overUnder.neutral')}
          </Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        {odds?.over_od != null && odds?.under_od != null && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              allowFontScaling={false}
              style={{
                color: colors.primary,
                fontSize: 11,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {Number(odds.over_od).toFixed(2)}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: colors.warning,
                fontSize: 11,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {Number(odds.under_od).toFixed(2)}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <View
            style={{
              flex: overProb,
              backgroundColor: overProb >= underProb ? colors.primary : colors.textMuted,
              opacity: overProb >= underProb ? 1 : 0.35,
            }}
          />
          <View
            style={{
              flex: underProb,
              backgroundColor: underProb > overProb ? colors.primary : colors.textMuted,
              opacity: underProb > overProb ? 1 : 0.35,
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
            }}
          >
            {t('cards.overUnder.over')}: {overProb.toFixed(1)}%
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
            }}
          >
            {t('cards.overUnder.under')}: {underProb.toFixed(1)}%
          </Text>
        </View>
      </View>

      {tp && <TotalPointsStats tp={tp} line={line} shortHome={shortHome} shortAway={shortAway} colors={colors} t={t} />}

      {factors.length > 0 && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 8 }}>
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
            {t('cards.overUnder.keyFactors')}
          </Text>
          {factors.map((f, i) => (
            <FactorRow key={`${f.label}-${i}`} factor={f} muted={colors.textMuted} />
          ))}
        </View>
      )}

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
              {t('cards.overUnder.scoringContext')}
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

function FactorRow({ factor, muted }: { factor: Factor; muted: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <factor.Icon size={13} color={factor.color} strokeWidth={2.4} style={{ marginTop: 1 }} />
      <Text
        allowFontScaling={false}
        style={{ flex: 1, fontSize: 12, lineHeight: 17, color: muted, fontWeight: '600' }}
      >
        <Text style={{ color: muted, fontWeight: '700' }}>{factor.label}: </Text>
        <Text style={{ color: factor.color, fontWeight: '600' }}>{factor.value}</Text>
      </Text>
    </View>
  );
}

function TotalPointsStats({
  tp,
  line,
  shortHome,
  shortAway,
  colors,
  t,
}: {
  tp: Record<string, any>;
  line: number | null;
  shortHome: string;
  shortAway: string;
  colors: ThemeColors;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}) {
  const avg = toNum(tp.avg_total_points) ?? 0;
  const min = toNum(tp.min_total_points) ?? 0;
  const max = toNum(tp.max_total_points) ?? 0;
  const totalMatches = toNum(tp.matches_analyzed) ?? 0;
  const dist = (tp.distribution ?? {}) as Record<string, number>;
  const maxBucket = Math.max(...Object.values(dist).map((v) => toNum(v) ?? 0), 1);
  const homeAvg = toNum(tp.home_avg_points);
  const awayAvg = toNum(tp.away_avg_points);

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 }}>
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
        {t('cards.overUnder.h2hPoints')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text
          allowFontScaling={false}
          style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] }}
        >
          {avg.toFixed(1)}
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
            {' '}
            {t('cards.overUnder.avg')}
          </Text>
        </Text>
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}
        >
          {min}–{max}
        </Text>
        {line != null && (
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: avg > line ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
              backgroundColor: avg > line ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                color: avg > line ? colors.success : colors.danger,
                fontSize: 10,
                fontWeight: '800',
              }}
            >
              {avg > line ? t('cards.overUnder.avgOver') : t('cards.overUnder.avgUnder')}
            </Text>
          </View>
        )}
      </View>

      {homeAvg != null && awayAvg != null && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text
            allowFontScaling={false}
            style={{ color: colors.primary, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] }}
          >
            {shortHome}: {homeAvg.toFixed(1)} {t('cards.overUnder.pts')}
          </Text>
          <Text
            allowFontScaling={false}
            style={{ color: colors.warning, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] }}
          >
            {shortAway}: {awayAvg.toFixed(1)} {t('cards.overUnder.pts')}
          </Text>
        </View>
      )}

      {totalMatches > 0 && Object.keys(dist).length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 48 }}>
          {POINT_BUCKETS.map(({ key, label }) => {
            const count = toNum(dist[key]) ?? 0;
            const pct = (count / maxBucket) * 100;
            return (
              <View key={key} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: '100%',
                    height: 28,
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 3,
                    justifyContent: 'flex-end',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      height: `${Math.max(pct, 4)}%`,
                      backgroundColor: colors.primary,
                      opacity: 0.7,
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  style={{ color: colors.textMuted, fontSize: 9, fontWeight: '700' }}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function buildFactors(ctx: {
  tp: Record<string, any> | undefined;
  line: number | null;
  shortHome: string;
  shortAway: string;
  favoredSide: 'over' | 'under';
  colors: ThemeColors;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): Factor[] {
  const { tp, line, shortHome, shortAway, favoredSide, colors, t } = ctx;
  const factors: Factor[] = [];
  if (!tp) return factors;

  const avg = toNum(tp.avg_total_points) ?? 0;
  const min = toNum(tp.min_total_points) ?? 0;
  const max = toNum(tp.max_total_points) ?? 0;
  const matches = toNum(tp.matches_analyzed) ?? 0;

  if (line != null && avg > 0) {
    const diff = avg - line;
    const aligned = (diff > 0 && favoredSide === 'over') || (diff < 0 && favoredSide === 'under');
    factors.push({
      Icon: BarChart3,
      label: t('cards.overUnder.avgVsLine'),
      value: `${t('cards.overUnder.h2hAvgLabel')} ${avg.toFixed(1)} ${t('cards.overUnder.pts')} — ${Math.abs(diff).toFixed(1)} ${t('cards.overUnder.pts')} ${diff > 0 ? t('cards.overUnder.above') : t('cards.overUnder.below')} ${t('cards.overUnder.line')} (${matches} ${t('cards.overUnder.matches')})`,
      color: aligned ? colors.success : colors.warning,
    });
  } else if (avg > 0) {
    factors.push({
      Icon: BarChart3,
      label: t('cards.overUnder.h2hAverage'),
      value: `${avg.toFixed(1)} ${t('cards.overUnder.pts')} (${matches} ${t('cards.overUnder.matches')})`,
      color: colors.textPrimary,
    });
  }

  if (min > 0 && max > 0) {
    const range = max - min;
    const variance =
      range > 40
        ? t('cards.overUnder.highVariance')
        : range > 25
          ? t('cards.overUnder.moderateVariance')
          : t('cards.overUnder.consistent');
    factors.push({
      Icon: TrendingUp,
      label: t('cards.overUnder.range'),
      value: `${min}–${max} ${t('cards.overUnder.pts')} (${variance})`,
      color: range > 40 ? colors.warning : colors.textPrimary,
    });
  }

  const homeAvg = toNum(tp.home_avg_points);
  const awayAvg = toNum(tp.away_avg_points);
  if (homeAvg != null && awayAvg != null && homeAvg > 0 && awayAvg > 0) {
    factors.push({
      Icon: TrendingUp,
      label: t('cards.overUnder.scoring'),
      value: `${shortHome} ${homeAvg.toFixed(1)} avg vs ${shortAway} ${awayAvg.toFixed(1)} avg`,
      color: colors.textPrimary,
    });
  }

  return factors;
}

function buildNarrative(ctx: {
  tp: Record<string, any> | undefined;
  line: number | null;
  shortHome: string;
  shortAway: string;
  favoredSide: 'over' | 'under';
  overProb: number;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): string | null {
  const { tp, line, shortHome, shortAway, favoredSide, overProb, t } = ctx;
  const sentences: string[] = [];
  const side = favoredSide === 'over' ? t('cards.overUnder.over') : t('cards.overUnder.under');
  const strength = Math.abs(overProb - 50);
  const openingKey = strength >= 15 ? 'narrativeStrongly' : strength >= 8 ? 'narrativeModerately' : 'narrativeSlightly';
  sentences.push(
    fill(t(`cards.overUnder.${openingKey}`), {
      side,
      line: line != null ? String(line) : '?',
    }),
  );

  if (!tp) return sentences.length <= 1 ? null : sentences.join(' ');

  const avg = toNum(tp.avg_total_points) ?? 0;
  const min = toNum(tp.min_total_points) ?? 0;
  const max = toNum(tp.max_total_points) ?? 0;

  if (line != null && avg > 0) {
    const diff = avg - line;
    if (Math.abs(diff) >= 5) {
      const aligned = (diff > 0) === (favoredSide === 'over');
      const direction = aligned ? t('cards.overUnder.supporting') : t('cards.overUnder.contradicting');
      const key = diff > 0 ? 'narrativeAvgAbove' : 'narrativeAvgBelow';
      sentences.push(
        fill(t(`cards.overUnder.${key}`), {
          avg: avg.toFixed(1),
          diff: Math.abs(diff).toFixed(1),
          direction,
        }),
      );
    } else {
      sentences.push(fill(t('cards.overUnder.narrativeAvgClose'), { avg: avg.toFixed(1) }));
    }
  }

  const range = max - min;
  if (range > 40) {
    sentences.push(fill(t('cards.overUnder.narrativeHighVariance'), { min: String(min), max: String(max) }));
  } else if (range > 0 && range <= 25) {
    sentences.push(fill(t('cards.overUnder.narrativeConsistent'), { min: String(min), max: String(max) }));
  }

  const homeAvg = toNum(tp.home_avg_points);
  const awayAvg = toNum(tp.away_avg_points);
  if (homeAvg != null && awayAvg != null && homeAvg > 0 && awayAvg > 0) {
    const higher = homeAvg > awayAvg ? shortHome : shortAway;
    const diff = Math.abs(homeAvg - awayAvg);
    if (diff >= 3) {
      sentences.push(
        fill(t('cards.overUnder.narrativeHigherScorer'), {
          name: higher,
          diff: diff.toFixed(1),
        }),
      );
    }
  }

  return sentences.length <= 1 ? null : sentences.join(' ');
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
