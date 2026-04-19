import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import { SetScoreGrid } from '../SetScoreGrid';
import type { LiveMatch } from '../../../api/useLiveMatches';

export function LiveMatchRow({ match, last }: { match: LiveMatch; last: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';

  const scoreEntries = Object.entries(match.scores ?? {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v);

  const homeSets = scoreEntries.map((s) => String(s.home ?? ''));
  const awaySets = scoreEntries.map((s) => String(s.away ?? ''));

  const wins = computeSetWins(homeSets, awaySets);
  const homeSetWins = wins.home;
  const awaySetWins = wins.away;
  const currentSetNum = resolveCurrentSet(match.current_set ?? null, homeSets, awaySets);
  const currentSetIdx = Math.max(0, currentSetNum - 1);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      <View style={{ width: 44, alignItems: 'flex-start' }}>
        <LiveBadge label={t('status.live').toUpperCase()} />

        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 9,
            lineHeight: 12,
            fontWeight: '700',
            marginTop: 2,
            fontVariant: ['tabular-nums'],
          }}
        >
          {t('set', { n: currentSetNum })}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: homeSetWins > awaySetWins ? colors.success : colors.textPrimary,
            fontSize: 12,
            lineHeight: 15,
            fontWeight: homeSetWins > awaySetWins ? '800' : '600',
          }}
        >
          {homeName}
        </Text>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: awaySetWins > homeSetWins ? colors.success : colors.textPrimary,
            fontSize: 12,
            lineHeight: 15,
            fontWeight: awaySetWins > homeSetWins ? '800' : '600',
          }}
        >
          {awayName}
        </Text>
      </View>

      <SetScoreGrid
        homeSets={homeSets}
        awaySets={awaySets}
        homeSetWins={homeSetWins}
        awaySetWins={awaySetWins}
        liveSetIndex={currentSetIdx}
      />
    </View>
  );
}

function LiveBadge({ label }: { label: string }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={{
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 3,
        backgroundColor: colors.danger,
        opacity: pulse,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}
      />
      <Text
        allowFontScaling={false}
        style={{
          color: '#ffffff',
          fontSize: 8,
          lineHeight: 10,
          fontWeight: '800',
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

function isCompletedSet(homeStr: string, awayStr: string): boolean {
  const h = Number(homeStr) || 0;
  const a = Number(awayStr) || 0;
  return (h >= 11 || a >= 11) && Math.abs(h - a) >= 2;
}

function computeSetWins(
  homeSets: string[],
  awaySets: string[],
): { home: number; away: number } {
  let homeWins = 0;
  let awayWins = 0;
  for (let i = 0; i < homeSets.length; i++) {
    const h = homeSets[i];
    const a = awaySets[i] ?? '';
    if (!isCompletedSet(h, a)) continue;
    if (Number(h) > Number(a)) homeWins++;
    else awayWins++;
  }
  return { home: homeWins, away: awayWins };
}

function resolveCurrentSet(
  currentSet: number | null,
  homeSets: string[],
  awaySets: string[],
): number {
  if (currentSet && currentSet > 0) return currentSet;
  if (homeSets.length === 0) return 1;
  const lastIdx = homeSets.length - 1;
  if (!isCompletedSet(homeSets[lastIdx], awaySets[lastIdx] ?? '')) return lastIdx + 1;
  return homeSets.length + 1;
}
