import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronRight, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSubscription } from '../../../api/useSubscription';
import { getMatchRibbon } from '../../../constants/ribbonLogic';
import { getRibbonAccent } from '../CornerRibbon';
import {
  formatDayLabel,
  formatHM,
  tsToDate,
  useLocaleBcp47,
} from '../dateLabels';
import { SetScoreGrid } from '../SetScoreGrid';
import { PlayerAvatar } from './PlayerAvatar';
import type { FinishedMatch } from '../../../api/useFinishedToday';
import type { UpcomingMatch } from '../../../api/types';

type Side = 'home' | 'away';
type Outcome = 'win' | 'loss' | 'unknown';

export function FinishedMatchRow({ match, last }: { match: FinishedMatch; last: boolean }) {
  const { colors } = useTheme();
  const sub = useSubscription();
  const showOutcome = sub.isPlusOrAbove;
  const bcp47 = useLocaleBcp47();
  const ribbon = getMatchRibbon(match as unknown as UpcomingMatch, sub.hasAccess);
  const accent = ribbon ? getRibbonAccent(ribbon.color, colors.primary) : null;

  const ss = parseSS(match.ss);
  const homeWon = ss ? ss.home > ss.away : false;
  const awayWon = ss ? ss.away > ss.home : false;

  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';
  const outcome = showOutcome ? evaluateOutcome(match) : 'unknown';

  const matchDate = tsToDate(Number(match.time));
  const dayLabel = matchDate ? formatDayLabel(matchDate, bcp47) : '—';
  const time = matchDate ? formatHM(matchDate) : '—';
  const leagueName = match.league?.name ?? '';

  const scoresObj = (match as FinishedMatch & { scores?: Record<string, { home: string; away: string }> })
    .scores;
  const scoreEntries = scoresObj
    ? Object.entries(scoresObj)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v)
    : [];
  const homeSets = scoreEntries.map((s) => String(s.home ?? ''));
  const awaySets = scoreEntries.map((s) => String(s.away ?? ''));

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
      <FinishedTimeCell dayLabel={dayLabel} time={time} outcome={outcome} />

      <View style={{ flex: 1, gap: 6 }}>
        <PlayerLine
          side="home"
          name={homeName}
          leagueName={leagueName}
          won={homeWon}
          lost={awayWon}
        />
        <PlayerLine
          side="away"
          name={awayName}
          leagueName={leagueName}
          won={awayWon}
          lost={homeWon}
        />
      </View>

      {scoreEntries.length > 0 ? (
        <SetScoreGrid
          homeSets={homeSets}
          awaySets={awaySets}
          homeSetWins={ss?.home ?? 0}
          awaySetWins={ss?.away ?? 0}
        />
      ) : (
        <FinalOnly homeSetWins={ss?.home ?? 0} awaySetWins={ss?.away ?? 0} />
      )}

      <ChevronRight size={12} color={colors.textMuted} />
    </Pressable>
  );
}

function FinishedTimeCell({
  dayLabel,
  time,
  outcome,
}: {
  dayLabel: string;
  time: string;
  outcome: Outcome;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ width: 44, alignItems: 'center' }}>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          color: colors.textMuted,
          fontSize: 9,
          lineHeight: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {dayLabel}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textPrimary,
          fontSize: 12,
          lineHeight: 15,
          fontWeight: '500',
          fontVariant: ['tabular-nums'],
          marginTop: 2,
        }}
      >
        {time}
      </Text>
      {outcome !== 'unknown' && <OutcomeBadge outcome={outcome} />}
    </View>
  );
}

function PlayerLine({
  side,
  name,
  leagueName,
  won,
  lost,
}: {
  side: Side;
  name: string;
  leagueName: string;
  won: boolean;
  lost: boolean;
}) {
  const { colors } = useTheme();
  const color = won ? colors.success : lost ? colors.textMuted : colors.textPrimary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <PlayerAvatar side={side} leagueName={leagueName} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color,
            fontSize: 12,
            lineHeight: 14,
            fontWeight: won ? '600' : '400',
            letterSpacing: -0.1,
          }}
        >
          {name}
        </Text>
      </View>
    </View>
  );
}

function FinalOnly({ homeSetWins, awaySetWins }: { homeSetWins: number; awaySetWins: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 10 }}>
      <Text
        allowFontScaling={false}
        style={{
          color: homeSetWins > awaySetWins ? colors.success : colors.textPrimary,
          fontSize: 14,
          lineHeight: 17,
          fontWeight: '600',
          fontVariant: ['tabular-nums'],
          textAlign: 'center',
        }}
      >
        {homeSetWins}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: awaySetWins > homeSetWins ? colors.success : colors.textPrimary,
          fontSize: 14,
          lineHeight: 17,
          fontWeight: '600',
          fontVariant: ['tabular-nums'],
          textAlign: 'center',
        }}
      >
        {awaySetWins}
      </Text>
    </View>
  );
}

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { colors } = useTheme();
  const bg = outcome === 'win' ? colors.success : colors.danger;
  const Icon = outcome === 'win' ? Check : X;
  return (
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}
    >
      <Icon size={8} color="#ffffff" strokeWidth={3.5} />
    </View>
  );
}

function evaluateOutcome(match: FinishedMatch): Outcome {
  const ss = parseSS(match.ss);
  if (!ss) return 'unknown';
  const homeProb = match.consolidatedPredictions?.matchWinner?.home_probability;
  if (homeProb == null) return 'unknown';
  const pickedHome = homeProb >= 50;
  const homeWon = ss.home > ss.away;
  if (homeWon === pickedHome) return 'win';
  return 'loss';
}

function parseSS(ss: string | undefined): { home: number; away: number } | null {
  if (!ss || ss.toLowerCase().includes('not')) return null;
  const parts = ss.split('-').map((p) => Number(p.trim()));
  if (parts.length !== 2) return null;
  const [h, a] = parts;
  if (!Number.isFinite(h) || !Number.isFinite(a)) return null;
  return { home: h, away: a };
}
