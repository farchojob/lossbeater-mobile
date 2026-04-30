import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import { useSubscription } from '../../../api/useSubscription';
import { getMatchRibbon } from '../../../constants/ribbonLogic';
import { getRibbonAccent } from '../CornerRibbon';
import { formatHM, tsToDate } from '../dateLabels';
import { FlashText } from '../FlashText';
import { PlayerAvatar } from './PlayerAvatar';
import { computeOddsTones, type OddsTone } from './ScheduledMatchRow';
import type { LiveMatch } from '../../../api/useLiveMatches';

type Side = 'home' | 'away';

export function LiveMatchRow({ match, last }: { match: LiveMatch; last: boolean }) {
  const { colors } = useTheme();
  const { hasAccess } = useSubscription();
  const ribbon = getMatchRibbon(match, hasAccess);
  const accent = ribbon ? getRibbonAccent(ribbon.color, colors.primary) : null;

  const scoreEntries = Object.entries(match.scores ?? {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v);

  const homeSets = scoreEntries.map((s) => String(s.home ?? ''));
  const awaySets = scoreEntries.map((s) => String(s.away ?? ''));

  const wins = computeSetWins(homeSets, awaySets);
  const homeLead = wins.home > wins.away;
  const awayLead = wins.away > wins.home;
  const currentSetNum = resolveCurrentSet(match.current_set ?? null, homeSets, awaySets);
  const currentSetIdx = Math.max(0, currentSetNum - 1);

  const matchDate = tsToDate(Number(match.time));
  const time = matchDate ? formatHM(matchDate) : '—';
  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';
  const leagueName = match.league?.name ?? '';

  const homeOdd = toFiniteNumber(match.odds?.matchWinner?.home_od);
  const awayOdd = toFiniteNumber(match.odds?.matchWinner?.away_od);
  const { homeTone, awayTone } = computeOddsTones(homeOdd, awayOdd);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/match/[id]', params: { id: String(match.id) } })
      }
      style={({ pressed }) => ({
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      {accent && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 3,
            backgroundColor: accent.accent,
            pointerEvents: 'none',
          }}
        />
      )}
      <LiveTimeCell time={time} currentSetNum={currentSetNum} />

      <View style={{ flex: 1, gap: 6 }}>
        <PlayerLine
          side="home"
          name={homeName}
          leagueName={leagueName}
          lead={homeLead}
          odd={homeOdd}
          tone={homeTone}
        />
        <PlayerLine
          side="away"
          name={awayName}
          leagueName={leagueName}
          lead={awayLead}
          odd={awayOdd}
          tone={awayTone}
        />
      </View>

      <SetScoreColumn
        homeSetWins={wins.home}
        awaySetWins={wins.away}
        homePoints={homeSets[currentSetIdx] ?? ''}
        awayPoints={awaySets[currentSetIdx] ?? ''}
      />

      <ChevronRight size={12} color={colors.textMuted} />
    </Pressable>
  );
}

function LiveTimeCell({
  time,
  currentSetNum,
}: {
  time: string;
  currentSetNum: number;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  return (
    <View style={{ width: 44, alignItems: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.danger,
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            color: colors.danger,
            fontSize: 9,
            lineHeight: 11,
            fontWeight: '800',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {t('set', { n: currentSetNum })}
        </Text>
      </View>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textPrimary,
          fontSize: 12,
          lineHeight: 14,
          fontWeight: '500',
          fontVariant: ['tabular-nums'],
          marginTop: 2,
        }}
      >
        {time}
      </Text>
    </View>
  );
}

function PlayerLine({
  side,
  name,
  leagueName,
  lead,
  odd,
  tone,
}: {
  side: Side;
  name: string;
  leagueName: string;
  lead: boolean;
  odd: number | null;
  tone: OddsTone;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <PlayerAvatar side={side} leagueName={leagueName} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: lead ? colors.success : colors.textPrimary,
            fontSize: 12,
            lineHeight: 14,
            fontWeight: lead ? '600' : '400',
            letterSpacing: -0.1,
          }}
        >
          {name}
        </Text>
      </View>
      <OddsPill odd={odd} tone={tone} />
    </View>
  );
}

function OddsPill({ odd, tone }: { odd: number | null; tone: OddsTone }) {
  const { colors } = useTheme();
  const hasOdd = odd != null;
  const base =
    tone === 'fav' ? colors.success : tone === 'dog' ? colors.danger : colors.warning;
  const fg = !hasOdd || tone === 'none' ? colors.textMuted : base;
  return (
    <View style={{ width: 38, alignItems: 'flex-end' }}>
      <Text
        allowFontScaling={false}
        style={{
          color: fg,
          fontSize: 11,
          lineHeight: 13,
          fontWeight: '500',
          fontVariant: ['tabular-nums'],
          opacity: 0.85,
        }}
      >
        {hasOdd ? odd!.toFixed(2) : '—'}
      </Text>
    </View>
  );
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

function SetScoreColumn({
  homeSetWins,
  awaySetWins,
  homePoints,
  awayPoints,
}: {
  homeSetWins: number;
  awaySetWins: number;
  homePoints: string;
  awayPoints: string;
}) {
  const { colors } = useTheme();
  const homeSetsLead = homeSetWins > awaySetWins;
  const awaySetsLead = awaySetWins > homeSetWins;
  const hpNum = Number(homePoints);
  const apNum = Number(awayPoints);
  const hpValid = Number.isFinite(hpNum);
  const apValid = Number.isFinite(apNum);
  const hpLabel = hpValid ? String(hpNum) : '—';
  const apLabel = apValid ? String(apNum) : '—';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
      }}
    >
      <View style={{ gap: 4, width: 20, alignItems: 'center' }}>
        <FlashText
          value={hpLabel}
          baseBg="transparent"
          flashBg={hexWithAlpha(colors.primary, 0.35)}
          flashDurationMs={900}
          style={{
            color: colors.primary,
            fontSize: 13,
            lineHeight: 15,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
            borderRadius: 3,
            width: 20,
            overflow: 'hidden',
          }}
        />
        <FlashText
          value={apLabel}
          baseBg="transparent"
          flashBg={hexWithAlpha(colors.primary, 0.35)}
          flashDurationMs={900}
          style={{
            color: colors.primary,
            fontSize: 13,
            lineHeight: 15,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
            borderRadius: 3,
            width: 20,
            overflow: 'hidden',
          }}
        />
      </View>
      <View style={{ gap: 4, width: 16, alignItems: 'center' }}>
        <Text
          allowFontScaling={false}
          style={{
            color: homeSetsLead
              ? colors.success
              : awaySetsLead
                ? colors.danger
                : colors.textPrimary,
            fontSize: 13,
            lineHeight: 15,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
          }}
        >
          {homeSetWins}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: awaySetsLead
              ? colors.success
              : homeSetsLead
                ? colors.danger
                : colors.textPrimary,
            fontSize: 13,
            lineHeight: 15,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
          }}
        >
          {awaySetWins}
        </Text>
      </View>
    </View>
  );
}

function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
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
