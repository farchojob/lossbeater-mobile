import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { UpcomingMatch } from '../../../api/types';
import { useSubscription } from '../../../api/useSubscription';
import { getMatchRibbon } from '../../../constants/ribbonLogic';
import { getRibbonAccent } from '../CornerRibbon';
import {
  formatDayLabel,
  formatHM,
  tsToDate,
  useLocaleBcp47,
} from '../dateLabels';
import { PlayerAvatar } from './PlayerAvatar';

export type OddsTone = 'fav' | 'dog' | 'even' | 'none';

type Side = 'home' | 'away';

type Slot = {
  side: Side;
  label: string;
  odd: number | null;
  fav: boolean;
  tone: OddsTone;
};

export function ScheduledMatchRow({
  match,
  last,
}: {
  match: UpcomingMatch;
  last: boolean;
}) {
  const { colors } = useTheme();
  const bcp47 = useLocaleBcp47();
  const { hasAccess } = useSubscription();

  const matchDate = tsToDate(Number(match.time));
  const dayLabel = matchDate ? formatDayLabel(matchDate, bcp47) : '—';
  const time = matchDate ? formatHM(matchDate) : '—';
  const { home, away } = buildSlots(match);
  const leagueName = match.league?.name ?? '';
  const ribbon = getMatchRibbon(match, hasAccess);
  const accent = ribbon ? getRibbonAccent(ribbon.color, colors.primary) : null;

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
        paddingLeft: 12,
        paddingRight: 12,
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
      <DateTimeCell dayLabel={dayLabel} time={time} />

      <View style={{ flex: 1, gap: 6 }}>
        <PlayerLine slot={home} leagueName={leagueName} />
        <PlayerLine slot={away} leagueName={leagueName} />
      </View>

      <ChevronRight size={12} color={colors.textMuted} />
    </Pressable>
  );
}

function DateTimeCell({ dayLabel, time }: { dayLabel: string; time: string }) {
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
    </View>
  );
}

function PlayerLine({
  slot,
  leagueName,
}: {
  slot: Slot;
  leagueName: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <PlayerAvatar side={slot.side} leagueName={leagueName} />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: slot.fav ? colors.textPrimary : colors.textSecondary,
            fontSize: 12,
            lineHeight: 14,
            fontWeight: slot.fav ? '600' : '400',
            letterSpacing: -0.1,
          }}
        >
          {slot.label}
        </Text>
      </View>

      <OddsPill odd={slot.odd} tone={slot.tone} />
    </View>
  );
}

function OddsPill({ odd, tone }: { odd: number | null; tone: OddsTone }) {
  const { colors } = useTheme();
  const hasOdd = odd != null;
  const palette = toneColors(colors, tone, hasOdd);
  return (
    <View style={{ width: 38, alignItems: 'flex-end' }}>
      <Text
        allowFontScaling={false}
        style={{
          color: palette.fg,
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

function toneColors(
  colors: {
    success: string;
    danger: string;
    warning: string;
    surfaceMuted: string;
    textMuted: string;
    border: string;
  },
  tone: OddsTone,
  hasOdd: boolean,
): { bg: string; fg: string; border: string } {
  if (!hasOdd || tone === 'none') {
    return { bg: colors.surfaceMuted, fg: colors.textMuted, border: colors.border };
  }
  const base =
    tone === 'fav' ? colors.success : tone === 'dog' ? colors.danger : colors.warning;
  return {
    bg: hexWithAlpha(base, 0.14),
    fg: base,
    border: hexWithAlpha(base, 0.32),
  };
}

function buildSlots(match: UpcomingMatch): { home: Slot; away: Slot } {
  const odds = match.odds?.matchWinner;
  const homeOdd = toFiniteNumber(odds?.home_od);
  const awayOdd = toFiniteNumber(odds?.away_od);
  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';
  const { homeTone, awayTone } = computeOddsTones(homeOdd, awayOdd);
  return {
    home: {
      side: 'home',
      label: homeName,
      odd: homeOdd,
      fav: homeTone === 'fav',
      tone: homeTone,
    },
    away: {
      side: 'away',
      label: awayName,
      odd: awayOdd,
      fav: awayTone === 'fav',
      tone: awayTone,
    },
  };
}

export function computeOddsTones(
  homeOdd: number | null,
  awayOdd: number | null,
): { homeTone: OddsTone; awayTone: OddsTone } {
  if (homeOdd == null || awayOdd == null) {
    return {
      homeTone: homeOdd == null ? 'none' : 'dog',
      awayTone: awayOdd == null ? 'none' : 'dog',
    };
  }
  if (homeOdd === awayOdd) return { homeTone: 'even', awayTone: 'even' };
  return homeOdd < awayOdd
    ? { homeTone: 'fav', awayTone: 'dog' }
    : { homeTone: 'dog', awayTone: 'fav' };
}

function toFiniteNumber(v: unknown): number | null {
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
