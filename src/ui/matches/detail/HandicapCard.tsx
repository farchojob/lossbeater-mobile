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

export function HandicapCard({ match }: { match: Match }) {
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslations('analysis');
  const { t: tCommon } = useTranslations('common');

  const homeName = (match.home as { name?: string } | undefined)?.name ?? tCommon('home');
  const awayName = (match.away as { name?: string } | undefined)?.name ?? tCommon('away');
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const odds = ((match.odds ?? {}) as Record<string, any>).handicap as
    | Record<string, any>
    | undefined;
  const h2h = ((match.tipster_analysis ?? {}) as Record<string, any>).h2h_points_sets_analysis as
    | Record<string, any>
    | undefined;
  const tp = (h2h?.total_points_analysis?.last10 ?? h2h?.total_points_analysis?.all_time) as
    | Record<string, any>
    | undefined;
  const sd = (h2h?.sets_distribution?.last10 ?? h2h?.sets_distribution?.all_time) as
    | Record<string, any>
    | undefined;

  const line = toNum(odds?.handicap);
  const homeOdds = toNum(odds?.home_od);
  const awayOdds = toNum(odds?.away_od);

  const homeAvg = toNum(tp?.home_avg_points);
  const awayAvg = toNum(tp?.away_avg_points);
  const diff = homeAvg != null && awayAvg != null ? homeAvg - awayAvg : null;

  const factors = buildFactors({ line, diff, homeAvg, awayAvg, shortHome, shortAway, colors, t });
  const narrative = buildNarrative({ line, diff, shortHome, shortAway, sd, t });

  if (!odds && !tp) {
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
          {t('cards.handicap.title')}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', textAlign: 'center', paddingVertical: 8 }}
        >
          {t('cards.handicap.noData')}
        </Text>
      </View>
    );
  }

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
            {t('cards.handicap.title')}
          </Text>
          {line != null ? (
            <Text
              allowFontScaling={false}
              style={{
                color: colors.textPrimary,
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.3,
              }}
            >
              <Text style={{ fontVariant: ['tabular-nums'] }}>
                {line > 0 ? '+' : ''}
                {line}
              </Text>
              <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: 14 }}>
                {'  '}
                {t('cards.handicap.sets')}
              </Text>
            </Text>
          ) : (
            <Text
              allowFontScaling={false}
              style={{ color: colors.textMuted, fontSize: 14, fontWeight: '700' }}
            >
              {t('cards.handicap.noLine')}
            </Text>
          )}
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
            {t('cards.handicap.dataInsights')}
          </Text>
        </View>
      </View>

      {homeOdds != null && awayOdds != null && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 10,
          }}
        >
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
            >
              {shortHome}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ color: colors.primary, fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] }}
            >
              {homeOdds.toFixed(2)}
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}
          >
            vs
          </Text>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}
            >
              {shortAway}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ color: colors.warning, fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] }}
            >
              {awayOdds.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {diff != null && homeAvg != null && awayAvg != null && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 6 }}>
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
            {t('cards.handicap.keyFactors')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text
              allowFontScaling={false}
              style={{
                color: diff > 0 ? colors.primary : diff < 0 ? colors.warning : colors.textPrimary,
                fontSize: 18,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {diff > 0 ? '+' : ''}
              {diff.toFixed(1)}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', flex: 1 }}
            >
              {t('cards.handicap.avgPointDiff')} —{' '}
              {diff > 0
                ? `${shortHome} ${t('cards.handicap.scoresMore')}`
                : diff < 0
                  ? `${shortAway} ${t('cards.handicap.scoresMore')}`
                  : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text
              allowFontScaling={false}
              style={{ color: colors.primary, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] }}
            >
              {shortHome}: {homeAvg.toFixed(1)} avg
            </Text>
            <Text
              allowFontScaling={false}
              style={{ color: colors.warning, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] }}
            >
              {shortAway}: {awayAvg.toFixed(1)} avg
            </Text>
          </View>
        </View>
      )}

      {factors.length > 0 && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 8 }}>
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
              {t('cards.handicap.handicapContext')}
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

function buildFactors(ctx: {
  line: number | null;
  diff: number | null;
  homeAvg: number | null;
  awayAvg: number | null;
  shortHome: string;
  shortAway: string;
  colors: ThemeColors;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): Factor[] {
  const { line, diff, shortHome, shortAway, colors, t } = ctx;
  const factors: Factor[] = [];

  if (line != null) {
    const favored = line < 0 ? shortHome : shortAway;
    const underdog = line < 0 ? shortAway : shortHome;
    factors.push({
      Icon: BarChart3,
      label: t('cards.handicap.line'),
      value: `${favored} (${line > 0 ? '+' : ''}${line}) vs ${underdog}`,
      color: colors.textPrimary,
    });
  }

  if (diff != null && line != null) {
    const stronger = diff > 0 ? shortHome : shortAway;
    const lineDirection = line < 0 ? shortHome : shortAway;
    const aligned = stronger === lineDirection;
    factors.push({
      Icon: TrendingUp,
      label: t('cards.handicap.avgPointDiff'),
      value: `${Math.abs(diff).toFixed(1)} pts — ${stronger}`,
      color: aligned ? colors.success : colors.warning,
    });
  }

  return factors;
}

function buildNarrative(ctx: {
  line: number | null;
  diff: number | null;
  shortHome: string;
  shortAway: string;
  sd: Record<string, any> | undefined;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}): string | null {
  const { line, diff, shortHome, shortAway, sd, t } = ctx;
  const sentences: string[] = [];

  if (line != null) {
    const favored = line < 0 ? shortHome : shortAway;
    const underdog = line < 0 ? shortAway : shortHome;
    sentences.push(
      fill(t('cards.handicap.narrative.bookmakerGives'), {
        favored,
        line: String(Math.abs(line)),
        underdog,
      }),
    );
  }

  if (diff != null && line != null) {
    const stronger = diff > 0 ? shortHome : shortAway;
    const lineDirection = line < 0 ? shortHome : shortAway;
    if (stronger === lineDirection) {
      sentences.push(
        fill(t('cards.handicap.narrative.h2hSupports'), {
          stronger,
          diff: Math.abs(diff).toFixed(1),
        }),
      );
    } else {
      sentences.push(
        fill(t('cards.handicap.narrative.h2hContradicts'), {
          stronger,
          diff: Math.abs(diff).toFixed(1),
        }),
      );
    }
  }

  const pct = ((sd?.distribution_percentages ?? {}) as Record<string, any>);
  const sweepPct = (toNum(pct['3-0']) ?? 0) + (toNum(pct['0-3']) ?? 0);
  if (sweepPct > 0) {
    if (sweepPct >= 40) {
      sentences.push(
        fill(t('cards.handicap.narrative.sweepRiskHigh'), { sweepPct: sweepPct.toFixed(0) }),
      );
    } else if (sweepPct <= 15 && line != null && Math.abs(line) >= 1.5) {
      sentences.push(
        fill(t('cards.handicap.narrative.sweepRateLow'), { sweepPct: sweepPct.toFixed(0) }),
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
