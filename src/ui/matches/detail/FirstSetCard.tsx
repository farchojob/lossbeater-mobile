import React from 'react';
import { Text, View } from 'react-native';
import { Sparkles, TrendingUp, Users } from 'lucide-react-native';
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

export function FirstSetCard({ match }: { match: Match }) {
  const { colors } = useTheme() as { colors: ThemeColors };
  const { t } = useTranslations('analysis');
  const { t: tCommon } = useTranslations('common');

  const homeName =
    (match.home as { name?: string } | undefined)?.name ?? tCommon('home');
  const awayName =
    (match.away as { name?: string } | undefined)?.name ?? tCommon('away');
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const cp = (match.consolidatedPredictions ?? {}) as Record<string, any>;
  const fs = (cp.firstSet ?? {}) as Record<string, any>;
  const hasFsProb = toNum(fs.home_probability) != null;
  const fsHomePct = toNum(fs.home_probability) ?? 50;
  const fsFavHome = fsHomePct >= 50;
  const displayProb = fsFavHome ? fsHomePct : 100 - fsHomePct;
  const displayName = fsFavHome ? shortHome : shortAway;

  const valueBet = (fs.valueBet ?? {}) as Record<string, any>;
  const signals = (fs.signals ?? {}) as Record<string, any>;
  const isValue = valueBet.isValueBet === true;
  const fsEdge = toNum(valueBet.edge);
  const impliedHome = toNum(signals.implied_home);

  const h2hPtsSets = ((match.tipster_analysis ?? {}) as Record<string, any>).h2h_points_sets_analysis as
    | Record<string, any>
    | undefined;
  const allSets = (h2hPtsSets?.all_sets_analysis?.last10 ??
    h2hPtsSets?.all_sets_analysis?.all_time ??
    {}) as Record<string, Record<string, any>>;

  const factors = buildFactors(match, { shortHome, shortAway, fsFavHome, allSets, colors, t });
  const narrative = hasFsProb
    ? buildNarrative(match, {
        shortHome,
        shortAway,
        fsFavHome,
        displayProb,
        displayName,
        allSets,
        t,
      })
    : null;

  const confDelta = Math.abs(displayProb - 50);
  const confLabel =
    confDelta >= 20
      ? t('cards.firstSet.highConf')
      : confDelta >= 8
        ? t('cards.firstSet.mediumConf')
        : t('cards.firstSet.lowConf');
  const confColor = confDelta >= 8 ? colors.primary : colors.textMuted;

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
            {t('cards.firstSet.title')}
          </Text>
          {hasFsProb ? (
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
          ) : (
            <Text
              allowFontScaling={false}
              style={{
                color: colors.textMuted,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {t('cards.firstSet.noPrediction', { defaultValue: 'No prediction' })}
            </Text>
          )}
        </View>
        {isValue ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: 'rgba(16,185,129,0.3)',
              backgroundColor: 'rgba(16,185,129,0.12)',
            }}
          >
            <Text
              allowFontScaling={false}
              style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}
            >
              {t('cards.firstSet.valueBet')}
            </Text>
          </View>
        ) : hasFsProb ? (
          <Text
            allowFontScaling={false}
            style={{ color: confColor, fontSize: 10, fontWeight: '700' }}
          >
            {confLabel} {t('cards.firstSet.conf')}
          </Text>
        ) : null}
      </View>

      {hasFsProb && (
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {fsEdge != null ? (
            <>
              <Text
                allowFontScaling={false}
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {t('cards.firstSet.implied')} {impliedHome != null ? Math.round(impliedHome) : '?'}%
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: fsEdge > 0 ? colors.success : colors.danger,
                  fontSize: 11,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {fsEdge > 0 ? '+' : ''}
                {fsEdge.toFixed(1)}% {t('cards.firstSet.edge')}
              </Text>
            </>
          ) : (
            <>
              <Text
                allowFontScaling={false}
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {Math.round(fsHomePct)}%
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
                {Math.round(100 - fsHomePct)}%
              </Text>
            </>
          )}
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
          <View style={{ flex: fsHomePct, backgroundColor: colors.primary }} />
          <View style={{ flex: 100 - fsHomePct, backgroundColor: colors.warning }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600', maxWidth: '48%' }}
          >
            {shortHome}
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
            {shortAway}
          </Text>
        </View>
      </View>
      )}

      {allSets.set_1 != null && (
        <SetsWinRateGrid
          allSets={allSets}
          shortHome={shortHome}
          shortAway={shortAway}
          colors={colors}
          t={t}
        />
      )}

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
            {t('cards.firstSet.keyFactors')}
          </Text>
          {factors.map((f, i) => (
            <FactorRow key={`${f.label}-${i}`} factor={f} muted={colors.textMuted} />
          ))}
        </View>
      )}

      {narrative && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 12,
            gap: 6,
          }}
        >
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
              {t('cards.firstSet.setContext')}
            </Text>
          </View>
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

function SetsWinRateGrid({
  allSets,
  shortHome,
  shortAway,
  colors,
  t,
}: {
  allSets: Record<string, Record<string, any>>;
  shortHome: string;
  shortAway: string;
  colors: ThemeColors;
  t: (key: string, opts?: { defaultValue?: string }) => string;
}) {
  const keys = ['set_1', 'set_2', 'set_3', 'set_4', 'set_5'];
  const labels = ['S1', 'S2', 'S3', 'S4', 'S5'];

  const renderRow = (side: 'home' | 'away') => {
    const label = side === 'home' ? shortHome : shortAway;
    const accent = side === 'home' ? colors.primary : colors.warning;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            flex: 1.3,
            color: accent,
            fontSize: 11,
            fontWeight: '800',
          }}
        >
          {label}
        </Text>
        {keys.map((k) => {
          const d = allSets[k];
          const matches = toNum(d?.matches_analyzed) ?? 0;
          if (!d || matches === 0) {
            return (
              <Text
                key={k}
                allowFontScaling={false}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                —
              </Text>
            );
          }
          const hw = toNum(d.home_win_rate) ?? 0;
          const aw = toNum(d.away_win_rate) ?? 0;
          const mine = side === 'home' ? hw : aw;
          const other = side === 'home' ? aw : hw;
          const winning = mine > other;
          return (
            <Text
              key={k}
              allowFontScaling={false}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: winning ? '800' : '600',
                fontVariant: ['tabular-nums'],
                color: winning ? colors.success : colors.textMuted,
              }}
            >
              {Math.round(mine)}%
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
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
        {t('cards.firstSet.h2hSetWinRates')}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <View style={{ flex: 1.3 }} />
        {labels.map((l) => (
          <Text
            key={l}
            allowFontScaling={false}
            style={{
              flex: 1,
              textAlign: 'center',
              color: colors.textMuted,
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}
          >
            {l}
          </Text>
        ))}
      </View>
      {renderRow('home')}
      {renderRow('away')}
    </View>
  );
}

function buildFactors(
  match: Match,
  ctx: {
    shortHome: string;
    shortAway: string;
    fsFavHome: boolean;
    allSets: Record<string, Record<string, any>>;
    colors: ThemeColors;
    t: (key: string, opts?: { defaultValue?: string }) => string;
  },
): Factor[] {
  const { shortHome, shortAway, fsFavHome, allSets, colors, t } = ctx;
  const factors: Factor[] = [];

  const s1 = allSets.set_1;
  const s1Matches = toNum(s1?.matches_analyzed) ?? 0;
  if (s1 && s1Matches > 0) {
    const homeWR = toNum(s1.home_win_rate) ?? 0;
    const awayWR = toNum(s1.away_win_rate) ?? 0;
    const favWR = fsFavHome ? homeWR : awayWR;
    factors.push({
      Icon: TrendingUp,
      label: t('cards.firstSet.h2hFirstSet'),
      value: `${shortHome} ${Math.round(homeWR)}% vs ${shortAway} ${Math.round(awayWR)}% (${s1Matches} ${t('cards.firstSet.matches')})`,
      color: favWR >= 65 ? colors.success : favWR >= 50 ? colors.textPrimary : colors.warning,
    });
  }

  const form = (match.form ?? {}) as Record<string, any>;
  const homeForm = form.home as Record<string, any> | undefined;
  const awayForm = form.away as Record<string, any> | undefined;
  if (homeForm || awayForm) {
    const homeWR = toNum(homeForm?.win_rate) ?? 0;
    const awayWR = toNum(awayForm?.win_rate) ?? 0;
    factors.push({
      Icon: TrendingUp,
      label: t('cards.firstSet.form'),
      value: `${shortHome} ${Math.round(homeWR)}% vs ${shortAway} ${Math.round(awayWR)}%`,
      color: colors.textPrimary,
    });
  }

  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;
  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal > 0) {
    const homeWins = toNum(h2h.home_wins) ?? 0;
    const awayWins = toNum(h2h.away_wins) ?? 0;
    const display = typeof h2h.display === 'string' ? h2h.display : `${homeWins}-${awayWins}`;
    factors.push({
      Icon: Users,
      label: t('cards.firstSet.h2hOverall'),
      value: `${display} (${h2hTotal} ${t('cards.firstSet.matches')})`,
      color: Math.abs(homeWins - awayWins) >= 3 ? colors.success : colors.textPrimary,
    });
  }

  return factors;
}

function buildNarrative(
  match: Match,
  ctx: {
    shortHome: string;
    shortAway: string;
    fsFavHome: boolean;
    displayProb: number;
    displayName: string;
    allSets: Record<string, Record<string, any>>;
    t: (key: string, opts?: { defaultValue?: string }) => string;
  },
): string | null {
  const { shortHome, shortAway, fsFavHome, displayProb, displayName, allSets, t } = ctx;
  const favName = displayName;
  const dogName = fsFavHome ? shortAway : shortHome;
  const sentences: string[] = [];

  const openingKey =
    displayProb >= 70
      ? 'narrativeStronglyFavors'
      : displayProb >= 60
        ? 'narrativeModeratelyFavors'
        : 'narrativeSlightlyFavors';
  sentences.push(
    fill(t(`cards.firstSet.${openingKey}`), {
      name: favName,
      prob: Math.round(displayProb).toString(),
    }),
  );

  const s1 = allSets.set_1;
  const s1Matches = toNum(s1?.matches_analyzed) ?? 0;
  if (s1 && s1Matches >= 2) {
    const homeWR = toNum(s1.home_win_rate) ?? 0;
    const awayWR = toNum(s1.away_win_rate) ?? 0;
    const favWR = fsFavHome ? homeWR : awayWR;
    const dogWR = fsFavHome ? awayWR : homeWR;
    if (favWR >= 70) {
      sentences.push(
        fill(t('cards.firstSet.narrativeDominates1stSet'), {
          name: favName,
          wr: Math.round(favWR).toString(),
        }),
      );
    } else if (dogWR > favWR) {
      sentences.push(
        fill(t('cards.firstSet.narrativeDogWinsMore1stSet'), {
          dog: dogName,
          wr: Math.round(dogWR).toString(),
        }),
      );
    } else if (Math.abs(favWR - dogWR) <= 10) {
      sentences.push(
        fill(t('cards.firstSet.narrativeEvenFirstSets'), {
          favWR: Math.round(favWR).toString(),
          dogWR: Math.round(dogWR).toString(),
        }),
      );
    } else {
      sentences.push(
        fill(t('cards.firstSet.narrativeFavWins1stSet'), {
          name: favName,
          wr: Math.round(favWR).toString(),
        }),
      );
    }
  }

  const h2h = (match.h2hRecord ?? {}) as Record<string, any>;
  const h2hTotal = toNum(h2h.total) ?? 0;
  if (h2hTotal >= 3) {
    const homeWins = toNum(h2h.home_wins) ?? 0;
    const awayWins = toNum(h2h.away_wins) ?? 0;
    const favWins = fsFavHome ? homeWins : awayWins;
    const dogWins = fsFavHome ? awayWins : homeWins;
    if (favWins >= dogWins * 2) {
      sentences.push(
        fill(t('cards.firstSet.narrativeDominatesH2H'), {
          name: favName,
          favW: String(favWins),
          dogW: String(dogWins),
        }),
      );
    } else if (favWins > dogWins) {
      sentences.push(
        fill(t('cards.firstSet.narrativeLeadsH2H'), {
          name: favName,
          favW: String(favWins),
          dogW: String(dogWins),
        }),
      );
    } else if (dogWins > favWins) {
      sentences.push(
        fill(t('cards.firstSet.narrativeDogLeadsH2H'), {
          dog: dogName,
          dogW: String(dogWins),
          favW: String(favWins),
        }),
      );
    }
  }

  const s5 = allSets.set_5;
  const s5Matches = toNum(s5?.matches_analyzed) ?? 0;
  if (s5 && s5Matches >= 2 && h2hTotal >= 5) {
    sentences.push(t('cards.firstSet.narrativeGoesDeep'));
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
