import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSubscription } from '../../../api/useSubscription';
import type { UpcomingMatch } from '../../../api/types';

export function ScheduledMatchRow({ match, last }: { match: UpcomingMatch; last: boolean }) {
  const { colors } = useTheme();
  const sub = useSubscription();
  const showProb = sub.isPlusOrAbove;

  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';
  const mw = match.consolidatedPredictions?.matchWinner;
  const homeProb = toFiniteNumber(mw?.home_probability);
  const awayProb = homeProb != null ? 100 - homeProb : null;
  const odds = match.odds?.matchWinner;
  const homeOdds = toFiniteNumber(odds?.home_od);
  const awayOdds = toFiniteNumber(odds?.away_od);

  const homeFav = (homeProb ?? 0) > (awayProb ?? 0);
  const awayFav = (awayProb ?? 0) > (homeProb ?? 0);

  const time = formatTime(Number(match.time));

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
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 12,
            lineHeight: 15,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
          }}
        >
          {time}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <PlayerLine name={homeName} prob={homeProb} odd={homeOdds} fav={homeFav} showProb={showProb} />
        <PlayerLine name={awayName} prob={awayProb} odd={awayOdds} fav={awayFav} showProb={showProb} />
      </View>
    </View>
  );
}

function PlayerLine({
  name,
  prob,
  odd,
  fav,
  showProb,
}: {
  name: string;
  prob: number | null;
  odd: number | null;
  fav: boolean;
  showProb: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          flex: 1,
          color: fav ? colors.success : colors.textPrimary,
          fontSize: 12,
          lineHeight: 15,
          fontWeight: fav ? '800' : '600',
        }}
      >
        {name}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          width: 38,
          color: showProb ? (fav ? colors.success : colors.textMuted) : colors.textMuted,
          fontSize: 10,
          lineHeight: 13,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
          opacity: showProb ? 1 : 0.35,
        }}
      >
        {showProb ? (prob != null ? `${Math.round(prob)}%` : '—') : '•••'}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          width: 38,
          color: colors.textPrimary,
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
        }}
      >
        {odd != null ? odd.toFixed(2) : '—'}
      </Text>
    </View>
  );
}

function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatTime(ts: number): string {
  if (!Number.isFinite(ts)) return '—';
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const now = new Date();
  const sameDay =
    now.getFullYear() === d.getFullYear() &&
    now.getMonth() === d.getMonth() &&
    now.getDate() === d.getDate();
  if (sameDay) return `${hh}:${mm}`;
  const day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${day}\n${hh}:${mm}`;
}
