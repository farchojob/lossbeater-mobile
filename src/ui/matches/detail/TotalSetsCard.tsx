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

export function TotalSetsCard({ match }: { match: Match }) {
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
  const sweeps = (h2h?.sweeps_analysis?.last10 ?? h2h?.sweeps_analysis?.all_time) as
    | Record<string, any>
    | undefined;

  if (!sd) {
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
          {t('cards.totalSets.title')}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center', paddingVertical: 8 }}
        >
          {t('cards.totalSets.noData')}
        </Text>
      </View>
    );
  }

  const avgSets = toNum(sd.avg_sets_played) ?? 0;
  const total = toNum(sd.total_matches) ?? 1;
  const comp = sd.competitiveness as Record<string, any> | undefined;
  const pct = (sd.distribution_percentages ?? {}) as Record<string, any>;

  const threeSetPct = (toNum(pct['3-0']) ?? 0) + (toNum(pct['0-3']) ?? 0);
  const fourSetPct = (toNum(pct['3-1']) ?? 0) + (toNum(pct['1-3']) ?? 0);
  const fiveSetPct = (toNum(pct['3-2']) ?? 0) + (toNum(pct['2-3']) ?? 0);
  const maxPct = Math.max(threeSetPct, fourSetPct, fiveSetPct, 1);

  const sweepRate = toNum(sweeps?.sweep_rate);
  const fiveSetRate = toNum(sweeps?.goes_to_5_sets_rate);

  const narrative = buildNarrative({
    avgSets,
    threeSetPct,
    fourSetPct,
    fiveSetPct,
    sweepRate,
    fiveSetRate,
    total,
    shortHome,
    shortAway,
    comp,
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
            {t('cards.totalSets.title')}
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
            <Text style={{ fontVariant: ['tabular-nums'] }}>{avgSets.toFixed(1)}</Text>
            <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>
              {'  '}
              {t('cards.totalSets.avgSets')}
            </Text>
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
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
              {t('cards.totalSets.dataInsights')}
            </Text>
          </View>
          {comp && <CompBadge level={comp.level as string} t={t} colors={colors} />}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <SetBar
          label={t('cards.totalSets.3sets')}
          pct={threeSetPct}
          maxPct={maxPct}
          colors={colors}
        />
        <SetBar
          label={t('cards.totalSets.4sets')}
          pct={fourSetPct}
          maxPct={maxPct}
          colors={colors}
        />
        <SetBar
          label={t('cards.totalSets.5sets')}
          pct={fiveSetPct}
          maxPct={maxPct}
          colors={colors}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 14,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 10,
        }}
      >
        {sweepRate != null && (
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
          >
            {t('cards.totalSets.sweepRate')}{' '}
            <Text style={{ color: colors.textPrimary, fontVariant: ['tabular-nums'] }}>
              {sweepRate.toFixed(0)}%
            </Text>
          </Text>
        )}
        {fiveSetRate != null && (
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
          >
            {t('cards.totalSets.goesTo5')}{' '}
            <Text style={{ color: colors.textPrimary, fontVariant: ['tabular-nums'] }}>
              {fiveSetRate.toFixed(0)}%
            </Text>
          </Text>
        )}
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
        >
          {total} {t('cards.totalSets.h2hMatches')}
        </Text>
      </View>

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
              {t('cards.totalSets.matchLengthContext')}
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

function SetBar({
  label,
  pct,
  maxPct,
  colors,
}: {
  label: string;
  pct: number;
  maxPct: number;
  colors: ThemeColors;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text
        allowFontScaling={false}
        style={{ width: 50, color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
      >
        {label}
      </Text>
      <View
        style={{
          flex: 1,
          height: 18,
          backgroundColor: colors.surfaceMuted,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${(pct / maxPct) * 100}%`,
            backgroundColor: colors.primary,
            opacity: 0.7,
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        allowFontScaling={false}
        style={{
          width: 38,
          textAlign: 'right',
          color: colors.textPrimary,
          fontSize: 11,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {pct.toFixed(0)}%
      </Text>
    </View>
  );
}

function CompBadge({
  level,
  t,
  colors,
}: {
  level: string;
  t: (key: string, opts?: { defaultValue?: string }) => string;
  colors: ThemeColors;
}) {
  const validKeys = ['very_close', 'close', 'moderate', 'one_sided', 'mixed'];
  const labelKey = validKeys.includes(level) ? level : 'mixed';
  const config: Record<string, { bg: string; fg: string; border: string }> = {
    very_close: { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    close: { bg: 'rgba(245,158,11,0.1)', fg: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    moderate: { bg: 'rgba(59,130,246,0.12)', fg: colors.primary, border: 'rgba(59,130,246,0.3)' },
    one_sided: { bg: 'rgba(239,68,68,0.12)', fg: colors.danger, border: 'rgba(239,68,68,0.3)' },
    mixed: { bg: colors.surfaceMuted, fg: colors.textMuted, border: colors.border },
  };
  const c = config[labelKey];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.bg,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{ color: c.fg, fontSize: 10, fontWeight: '800' }}
      >
        {t(`cards.totalSets.competitiveness.${labelKey}`)}
      </Text>
    </View>
  );
}

function buildNarrative(ctx: {
  avgSets: number;
  threeSetPct: number;
  fourSetPct: number;
  fiveSetPct: number;
  sweepRate: number | null;
  fiveSetRate: number | null;
  total: number;
  shortHome: string;
  shortAway: string;
  comp: Record<string, any> | undefined;
  match: Match;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): string | null {
  const {
    avgSets,
    threeSetPct,
    fourSetPct,
    fiveSetPct,
    sweepRate,
    fiveSetRate,
    total,
    shortHome,
    shortAway,
    comp,
    match,
    t,
  } = ctx;
  const sentences: string[] = [];
  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;

  const level = comp?.level as string | undefined;
  if (level === 'very_close' || level === 'close') {
    sentences.push(
      fill(t('cards.totalSets.narrative.veryCompetitive'), {
        avgSets: avgSets.toFixed(1),
        total: String(total),
      }),
    );
  } else if (level === 'one_sided') {
    sentences.push(
      fill(t('cards.totalSets.narrative.oneSided'), { avgSets: avgSets.toFixed(1) }),
    );
  } else {
    sentences.push(
      fill(t('cards.totalSets.narrative.neutral'), {
        avgSets: avgSets.toFixed(1),
        total: String(total),
      }),
    );
  }

  const most = Math.max(threeSetPct, fourSetPct, fiveSetPct);
  if (most === threeSetPct && threeSetPct >= 40) {
    sentences.push(
      fill(t('cards.totalSets.narrative.straightSetsHigh'), { pct: threeSetPct.toFixed(0) }),
    );
  } else if (most === fiveSetPct && fiveSetPct >= 30) {
    sentences.push(
      fill(t('cards.totalSets.narrative.fiveSetHigh'), { pct: fiveSetPct.toFixed(0) }),
    );
  } else if (most === fourSetPct && fourSetPct >= 40) {
    sentences.push(
      fill(t('cards.totalSets.narrative.fourSetHigh'), { pct: fourSetPct.toFixed(0) }),
    );
  }

  if (sweepRate != null && sweepRate >= 50) {
    sentences.push(
      fill(t('cards.totalSets.narrative.sweepRateHigh'), { sweepRate: sweepRate.toFixed(0) }),
    );
  } else if (fiveSetRate != null && fiveSetRate >= 40) {
    sentences.push(
      fill(t('cards.totalSets.narrative.fiveSetRateHigh'), { fiveSetRate: fiveSetRate.toFixed(0) }),
    );
  }

  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal >= 5) {
    const homeWins = toNum(h2h.home_wins) ?? 0;
    const awayWins = toNum(h2h.away_wins) ?? 0;
    const ratio = Math.max(homeWins, awayWins) / Math.max(Math.min(homeWins, awayWins), 1);
    if (ratio >= 3 && threeSetPct >= 35) {
      const dominant = homeWins > awayWins ? shortHome : shortAway;
      sentences.push(
        fill(t('cards.totalSets.narrative.dominanceWithSweeps'), { dominant }),
      );
    }
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
