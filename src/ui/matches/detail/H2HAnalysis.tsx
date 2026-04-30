import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Users } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import type { AnyMatch } from '../../../api/useMatchById';

type Match = Record<string, unknown> & AnyMatch;

const ALL_WINDOWS = [
  'last5',
  'last10',
  'last20',
  'last50',
  'last100',
  'last6Months',
  'all_time',
] as const;
const WINDOW_ALIASES: Record<string, string> = { all_time: 'sinceJan1' };

export function H2HAnalysis({ match }: { match: Match }) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const [selectedWindow, setSelectedWindow] = useState<string>('last10');

  const homeName = shortName((match.home as { name?: string } | undefined)?.name ?? 'Home');
  const awayName = shortName((match.away as { name?: string } | undefined)?.name ?? 'Away');

  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;
  const h2hSummary = (ta.h2h_summary ?? {}) as Record<string, any>;
  const tcWindows = ((ta.temporal_comparison ?? {}) as Record<string, any>).windows ?? {};
  const homeIsPlayerA = h2hSummary.home_is_player_a ?? true;
  const h2hPtsSets = (ta.h2h_points_sets_analysis ?? {}) as Record<string, any>;

  const getWindowCount = (w: string): number => {
    const alias = WINDOW_ALIASES[w];
    const tp =
      h2hPtsSets.total_points_analysis?.[w] ||
      (alias ? h2hPtsSets.total_points_analysis?.[alias] : null);
    const sd =
      h2hPtsSets.sets_distribution?.[w] ||
      (alias ? h2hPtsSets.sets_distribution?.[alias] : null);
    const tc = tcWindows[w] || (alias ? tcWindows[alias] : null);
    const fromTc = (tc?.results?.player_a_won ?? 0) + (tc?.results?.player_b_won ?? 0);
    return tp?.matches_analyzed ?? sd?.total_matches ?? fromTc;
  };

  const availableWindows = useMemo(() => {
    const result: string[] = [];
    const seen = new Set<number>();
    for (const w of ALL_WINDOWS) {
      const c = getWindowCount(w);
      if (c === 0 || seen.has(c)) continue;
      result.push(w);
      seen.add(c);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tcWindows, h2hPtsSets]);

  const activeWindow = availableWindows.includes(selectedWindow)
    ? selectedWindow
    : availableWindows[0] || 'last10';

  const getStat = (section: string): Record<string, any> => {
    const alias = WINDOW_ALIASES[activeWindow];
    return (
      h2hPtsSets[section]?.[activeWindow] ||
      (alias ? h2hPtsSets[section]?.[alias] : undefined) ||
      {}
    );
  };

  const tp = getStat('total_points_analysis');
  const fs = getStat('first_set_analysis');
  const sw = getStat('sweeps_analysis');
  const setsDist = getStat('sets_distribution');
  const setsDistPct = (setsDist.distribution_percentages ?? {}) as Record<string, number>;
  const competitiveness = setsDist.competitiveness as Record<string, any> | undefined;
  const allSets = getStat('all_sets_analysis');
  const alias = WINDOW_ALIASES[activeWindow];
  const recent = (h2hPtsSets.recent_matches?.[activeWindow] ||
    (alias ? h2hPtsSets.recent_matches?.[alias] : undefined) ||
    []) as Array<Record<string, any>>;
  const overUnder = (match.consolidatedPredictions as Record<string, any> | undefined)?.overUnder;

  const tcWindow =
    tcWindows[activeWindow] ||
    (alias ? tcWindows[alias] : undefined) ||
    ({} as Record<string, any>);
  const results = (tcWindow.results ?? {}) as Record<string, number>;
  let homeH2HWins = homeIsPlayerA ? results.player_a_won ?? 0 : results.player_b_won ?? 0;
  let awayH2HWins = homeIsPlayerA ? results.player_b_won ?? 0 : results.player_a_won ?? 0;

  if (homeH2HWins + awayH2HWins === 0) {
    if (recent.length > 0) {
      homeH2HWins = recent.filter((m) => m.homeWon).length;
      awayH2HWins = recent.filter((m) => !m.homeWon).length;
    } else if ((setsDist.total_matches ?? 0) > 0) {
      const total = setsDist.total_matches as number;
      const homePct =
        (setsDistPct['3-0'] ?? 0) + (setsDistPct['3-1'] ?? 0) + (setsDistPct['3-2'] ?? 0);
      homeH2HWins = Math.round((total * homePct) / 100);
      awayH2HWins = total - homeH2HWins;
    }
  }

  const totalH2H = homeH2HWins + awayH2HWins;
  const h2hWinRate = totalH2H > 0 ? (homeH2HWins / totalH2H) * 100 : 0;
  const hasH2H = totalH2H > 0;

  const homeAvg = tp.home_avg_points as number | undefined;
  const awayAvg = tp.away_avg_points as number | undefined;
  const homeFs = fs.home_first_set_win_rate as number | undefined;
  const awayFs = fs.away_first_set_win_rate as number | undefined;
  const homeSweeps = (sw.home_sweeps ?? 0) as number;
  const awaySweeps = (sw.away_sweeps ?? 0) as number;

  const temporalKey = activeWindow === 'all_time' ? 'sinceJan1' : activeWindow;
  const ps = (match.player_stats ?? {}) as Record<string, any>;
  const homeTemp =
    ps.home?.temporal?.[temporalKey] || ps.home?.temporal?.[activeWindow] || {};
  const awayTemp =
    ps.away?.temporal?.[temporalKey] || ps.away?.temporal?.[activeWindow] || {};

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Users size={16} color={colors.primary} strokeWidth={2.5} />
          <Text
            allowFontScaling={false}
            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}
          >
            {t('h2h.title')}
          </Text>
        </View>
        {hasH2H && (
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 11,
              fontVariant: ['tabular-nums'],
            }}
          >
            {totalH2H} {t('h2h.h2hMatches')}
          </Text>
        )}
      </View>

      <View style={{ padding: 14, gap: 14 }}>
        {availableWindows.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {availableWindows.map((w) => {
              const active = activeWindow === w;
              return (
                <Pressable
                  key={w}
                  onPress={() => setSelectedWindow(w)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: active ? colors.surface : colors.surfaceMuted,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: active ? colors.primary : colors.textMuted,
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {t(`h2h.windowsShort.${w}`)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {hasH2H ? (
          <>
            <RecordBar
              homeName={homeName}
              awayName={awayName}
              homeWins={homeH2HWins}
              awayWins={awayH2HWins}
              homeRate={h2hWinRate}
            />

            {(Object.keys(setsDistPct).length > 0 || competitiveness) && (
              <ScorelineChips
                competitiveness={competitiveness}
                setsDistPct={setsDistPct}
              />
            )}

            {allSets.set_1 && (
              <SetsGrid allSets={allSets} homeName={homeName} awayName={awayName} />
            )}

            {tp.avg_total_points != null && (
              <TotalPointsSection
                tp={tp}
                overUnder={overUnder as Record<string, any> | undefined}
                homeName={homeName}
                awayName={awayName}
              />
            )}

            {recent.length > 0 && (
              <RecentMatches matches={recent} homeName={homeName} awayName={awayName} />
            )}

            <CompTable
              label={t('h2h.faceToFace')}
              rows={[
                {
                  label: t('h2h.winRate'),
                  home: `${h2hWinRate.toFixed(1)}%`,
                  away: `${(100 - h2hWinRate).toFixed(1)}%`,
                  homeWins: h2hWinRate > 50,
                },
                ...(homeFs != null && awayFs != null
                  ? [
                      {
                        label: t('h2h.firstSetWR'),
                        home: `${homeFs.toFixed(1)}%`,
                        away: `${awayFs.toFixed(1)}%`,
                        homeWins: homeFs > awayFs,
                      },
                    ]
                  : []),
                ...(homeAvg != null && awayAvg != null
                  ? [
                      {
                        label: t('h2h.avgPoints'),
                        home: homeAvg.toFixed(1),
                        away: awayAvg.toFixed(1),
                        homeWins: homeAvg > awayAvg,
                      },
                    ]
                  : []),
                ...(homeSweeps > 0 || awaySweeps > 0
                  ? [
                      {
                        label: t('h2h.sweeps'),
                        home: String(homeSweeps),
                        away: String(awaySweeps),
                        homeWins: homeSweeps > awaySweeps,
                      },
                    ]
                  : []),
              ]}
            />
          </>
        ) : (
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textMuted,
              fontSize: 12,
              textAlign: 'center',
              paddingVertical: 6,
            }}
          >
            {t('h2h.noHistory')}
          </Text>
        )}

        <CompTable
          label={t('h2h.individualPerformance')}
          rows={[
            {
              label: t('h2h.winRate'),
              home: `${(toNum(homeTemp.winRate) ?? toNum(ps.home?.winRate) ?? 0).toFixed(1)}%`,
              away: `${(toNum(awayTemp.winRate) ?? toNum(ps.away?.winRate) ?? 0).toFixed(1)}%`,
              homeWins:
                (toNum(homeTemp.winRate) ?? 0) > (toNum(awayTemp.winRate) ?? 0),
            },
            {
              label: t('h2h.firstSetWR'),
              home: `${(toNum(homeTemp.firstSetWinRate) ?? 0).toFixed(1)}%`,
              away: `${(toNum(awayTemp.firstSetWinRate) ?? 0).toFixed(1)}%`,
              homeWins:
                (toNum(homeTemp.firstSetWinRate) ?? 0) >
                (toNum(awayTemp.firstSetWinRate) ?? 0),
            },
            {
              label: t('h2h.avgSetsWon'),
              home: (toNum(homeTemp.avgSetsWon) ?? 0).toFixed(1),
              away: (toNum(awayTemp.avgSetsWon) ?? 0).toFixed(1),
              homeWins:
                (toNum(homeTemp.avgSetsWon) ?? 0) > (toNum(awayTemp.avgSetsWon) ?? 0),
            },
            {
              label: t('h2h.avgPtsMatch'),
              home: (
                toNum(homeTemp.avgPointsPerMatch) ??
                toNum(ps.home?.avgPointsPerMatch) ??
                0
              ).toFixed(1),
              away: (
                toNum(awayTemp.avgPointsPerMatch) ??
                toNum(ps.away?.avgPointsPerMatch) ??
                0
              ).toFixed(1),
              homeWins:
                (toNum(homeTemp.avgPointsPerMatch) ?? 0) >
                (toNum(awayTemp.avgPointsPerMatch) ?? 0),
            },
          ]}
        />
      </View>
    </View>
  );
}

function RecordBar({
  homeName,
  awayName,
  homeWins,
  awayWins,
  homeRate,
}: {
  homeName: string;
  awayName: string;
  homeWins: number;
  awayWins: number;
  homeRate: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceMuted,
        padding: 10,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800', maxWidth: 110 }}
        >
          {homeName}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontVariant: ['tabular-nums'],
            fontWeight: '700',
          }}
        >
          {homeWins}W — {awayWins}W
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800', maxWidth: 110 }}
        >
          {awayName}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.surface,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            width: `${Math.max(0, Math.min(100, homeRate))}%`,
            backgroundColor: colors.primary,
          }}
        />
        <View style={{ flex: 1, backgroundColor: colors.warning }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          allowFontScaling={false}
          style={{
            color: homeRate >= 50 ? colors.primary : colors.textMuted,
            fontSize: 11,
            fontVariant: ['tabular-nums'],
            fontWeight: '800',
          }}
        >
          {homeRate.toFixed(0)}%
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: homeRate < 50 ? colors.warning : colors.textMuted,
            fontSize: 11,
            fontVariant: ['tabular-nums'],
            fontWeight: '800',
          }}
        >
          {(100 - homeRate).toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

function ScorelineChips({
  competitiveness,
  setsDistPct,
}: {
  competitiveness: Record<string, any> | undefined;
  setsDistPct: Record<string, number>;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const scores = ['3-0', '3-1', '3-2', '0-3', '1-3', '2-3'];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {competitiveness && (
        <CompetitivenessBadge level={String(competitiveness.level ?? 'mixed')} />
      )}
      {scores.map((s) => {
        const pct = setsDistPct[s] ?? 0;
        if (pct === 0) return null;
        const isHomeWin = s.startsWith('3');
        const tint = isHomeWin ? colors.primary : colors.warning;
        return (
          <View
            key={s}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: hexWithAlpha(tint, 0.12),
              borderWidth: 1,
              borderColor: hexWithAlpha(tint, 0.3),
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                color: tint,
                fontSize: 11,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {s}: {pct.toFixed(0)}%
            </Text>
          </View>
        );
      })}
      {/* retain t() reference for lint */}
      <Text style={{ display: 'none' }}>{t('h2h.h2hMatches')}</Text>
    </View>
  );
}

function CompetitivenessBadge({ level }: { level: string }) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const map: Record<string, string> = {
    very_close: colors.warning,
    close: colors.warning,
    moderate: colors.primary,
    one_sided: colors.danger,
    mixed: colors.textMuted,
  };
  const tint = map[level] ?? colors.textMuted;
  const valid = ['very_close', 'close', 'moderate', 'one_sided', 'mixed'].includes(level)
    ? level
    : 'mixed';
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: hexWithAlpha(tint, 0.1),
        borderWidth: 1,
        borderColor: hexWithAlpha(tint, 0.3),
      }}
    >
      <Text
        allowFontScaling={false}
        style={{ color: tint, fontSize: 11, fontWeight: '800' }}
      >
        {t(`h2h.competitiveness.${valid}`)}
      </Text>
    </View>
  );
}

function SetsGrid({
  allSets,
  homeName,
  awayName,
}: {
  allSets: Record<string, any>;
  homeName: string;
  awayName: string;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const sets = ['set_1', 'set_2', 'set_3', 'set_4', 'set_5'];
  const labels = ['S1', 'S2', 'S3', 'S4', 'S5'];

  return (
    <View style={{ gap: 6 }}>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {t('h2h.setWinRates')}
      </Text>

      <View
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surfaceMuted,
            paddingVertical: 6,
          }}
        >
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
                fontWeight: '800',
                letterSpacing: 0.4,
              }}
            >
              {l}
            </Text>
          ))}
        </View>

        <SetRow
          label={homeName}
          labelColor={colors.primary}
          values={sets.map((s) => {
            const d = allSets[s] as Record<string, any> | undefined;
            if (!d || (d.matches_analyzed ?? 0) === 0) return null;
            return { me: toNum(d.home_win_rate) ?? 0, other: toNum(d.away_win_rate) ?? 0 };
          })}
          highlightColor={colors.success}
        />
        <SetRow
          label={awayName}
          labelColor={colors.warning}
          values={sets.map((s) => {
            const d = allSets[s] as Record<string, any> | undefined;
            if (!d || (d.matches_analyzed ?? 0) === 0) return null;
            return { me: toNum(d.away_win_rate) ?? 0, other: toNum(d.home_win_rate) ?? 0 };
          })}
          highlightColor={colors.success}
          divider
        />
      </View>
    </View>
  );
}

function SetRow({
  label,
  labelColor,
  values,
  highlightColor,
  divider,
}: {
  label: string;
  labelColor: string;
  values: Array<{ me: number; other: number } | null>;
  highlightColor: string;
  divider?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderTopWidth: divider ? 1 : 0,
        borderTopColor: colors.border,
      }}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          flex: 1.3,
          paddingHorizontal: 10,
          color: labelColor,
          fontSize: 11,
          fontWeight: '800',
        }}
      >
        {label}
      </Text>
      {values.map((v, i) => {
        if (!v) {
          return (
            <Text
              key={i}
              allowFontScaling={false}
              style={{
                flex: 1,
                textAlign: 'center',
                color: colors.textMuted,
                fontSize: 11,
              }}
            >
              —
            </Text>
          );
        }
        const wins = v.me > v.other;
        return (
          <Text
            key={i}
            allowFontScaling={false}
            style={{
              flex: 1,
              textAlign: 'center',
              color: wins ? highlightColor : colors.textMuted,
              fontSize: 11,
              fontWeight: wins ? '800' : '600',
              fontVariant: ['tabular-nums'],
            }}
          >
            {v.me.toFixed(0)}%
          </Text>
        );
      })}
    </View>
  );
}

const POINT_BUCKETS = [
  { key: 'under_60', label: '<60' },
  { key: '60_70', label: '60-70' },
  { key: '70_80', label: '70-80' },
  { key: '80_90', label: '80-90' },
  { key: 'over_90', label: '90+' },
];

function TotalPointsSection({
  tp,
  overUnder,
  homeName,
  awayName,
}: {
  tp: Record<string, any>;
  overUnder: Record<string, any> | undefined;
  homeName: string;
  awayName: string;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const avg = toNum(tp.avg_total_points);
  const min = toNum(tp.min_total_points);
  const max = toNum(tp.max_total_points);
  const median = toNum(tp.median_total_points);
  const dist = (tp.distribution ?? {}) as Record<string, number>;
  const totalMatches = (tp.matches_analyzed ?? 0) as number;
  const maxBucket = Math.max(...Object.values(dist).map(Number), 1);
  const ouLine = toNum(overUnder?.line);
  const isOverAvg = ouLine != null && avg != null && avg > ouLine;
  const homeAvg = toNum(tp.home_avg_points);
  const awayAvg = toNum(tp.away_avg_points);

  return (
    <View
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceMuted,
        padding: 12,
        gap: 10,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {t('h2h.totalPoints')}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {avg != null ? avg.toFixed(1) : '—'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t('h2h.avg')}</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('h2h.range')}:{' '}
          <Text style={{ color: colors.textPrimary, fontVariant: ['tabular-nums'] }}>
            {min ?? '—'}
          </Text>
          –
          <Text style={{ color: colors.textPrimary, fontVariant: ['tabular-nums'] }}>
            {max ?? '—'}
          </Text>
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('h2h.median')}:{' '}
          <Text style={{ color: colors.textPrimary, fontVariant: ['tabular-nums'] }}>
            {median ?? '—'}
          </Text>
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 10 }}>
          ({totalMatches} {t('h2h.matches')})
        </Text>
      </View>

      {homeAvg != null && awayAvg != null && (
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Text
            allowFontScaling={false}
            style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}
          >
            {homeName}: {homeAvg.toFixed(1)} pts
          </Text>
          <Text
            allowFontScaling={false}
            style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}
          >
            {awayName}: {awayAvg.toFixed(1)} pts
          </Text>
        </View>
      )}

      {totalMatches > 0 && Object.keys(dist).length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 52 }}>
          {POINT_BUCKETS.map(({ key, label }) => {
            const count = dist[key] ?? 0;
            const pct = (count / maxBucket) * 100;
            return (
              <View key={key} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: '100%',
                    height: 34,
                    backgroundColor: colors.surface,
                    borderRadius: 4,
                    justifyContent: 'flex-end',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: `${Math.max(pct, 6)}%`,
                      backgroundColor: hexWithAlpha(colors.primary, 0.6),
                    }}
                  />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 9 }}>{label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {ouLine != null && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t('h2h.ouLine')}</Text>
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 12,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {ouLine}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
              backgroundColor: hexWithAlpha(
                isOverAvg ? colors.success : colors.danger,
                0.1,
              ),
              borderWidth: 1,
              borderColor: hexWithAlpha(
                isOverAvg ? colors.success : colors.danger,
                0.3,
              ),
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                color: isOverAvg ? colors.success : colors.danger,
                fontSize: 10,
                fontWeight: '800',
              }}
            >
              {isOverAvg ? t('h2h.h2hAvgOver') : t('h2h.h2hAvgUnder')}
            </Text>
          </View>
          {overUnder?.over_probability != null && (
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>
              Over {Number(overUnder.over_probability).toFixed(0)}% / Under{' '}
              {Number(overUnder.under_probability ?? 0).toFixed(0)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function RecentMatches({
  matches,
  homeName,
  awayName,
}: {
  matches: Array<Record<string, any>>;
  homeName: string;
  awayName: string;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  return (
    <View style={{ gap: 6 }}>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {t('h2h.recentEncounters')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {matches.map((m, i) => {
          const homeWon = Boolean(m.homeWon);
          const tint = homeWon ? colors.primary : colors.warning;
          const label = homeWon ? homeName : awayName;
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: hexWithAlpha(tint, 0.1),
                borderWidth: 1,
                borderColor: hexWithAlpha(tint, 0.3),
              }}
              accessibilityLabel={`${label} ${m.result} ${m.total}pts`}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: tint,
                }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  color: tint,
                  fontSize: 11,
                  fontWeight: '800',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {m.result}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>{m.total}pts</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CompTable({
  label,
  rows,
}: {
  label: string;
  rows: Array<{ label: string; home: string; away: string; homeWins: boolean }>;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{ flex: 1.3, color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}
            >
              {r.label}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                flex: 1,
                textAlign: 'right',
                paddingRight: 14,
                color: r.homeWins ? colors.primary : colors.textMuted,
                fontSize: 12,
                fontWeight: r.homeWins ? '800' : '600',
                fontVariant: ['tabular-nums'],
              }}
            >
              {r.home}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                flex: 1,
                textAlign: 'right',
                color: !r.homeWins ? colors.warning : colors.textMuted,
                fontSize: 12,
                fontWeight: !r.homeWins ? '800' : '600',
                fontVariant: ['tabular-nums'],
              }}
            >
              {r.away}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function shortName(fullName: string): string {
  const parts = (fullName || '').split(/\s+/).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!/^\d+$/.test(parts[i])) return parts[i];
  }
  return parts[parts.length - 1] || fullName;
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  return `${normalized}${aHex}`;
}
