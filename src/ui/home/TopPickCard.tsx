import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Flame, Shield, Sparkle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { UpcomingMatch } from '../../api/types';

type Props = {
  match: UpcomingMatch;
  onPress?: (match: UpcomingMatch) => void;
};

export function TopPickCard({ match, onPress }: Props) {
  const { colors } = useTheme();
  const parsed = useMemo(() => parseMatch(match), [match]);
  if (!parsed) return null;

  const {
    leagueName,
    timeLabel,
    home,
    away,
    pickedSide,
    pickedProb,
    pickedOdds,
    pickedName,
    otherName,
    tier,
    grade,
    reason,
  } = parsed;

  return (
    <Pressable
      onPress={() => onPress?.(match)}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        gap: 12,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TierBadge tier={tier} grade={grade} />
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {leagueName}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
          {timeLabel}
        </Text>
      </View>

      <View style={{ gap: 6 }}>
        <PlayerRow
          name={home.name}
          probability={home.probability}
          odds={home.odds}
          highlighted={pickedSide === 'home'}
          colors={colors}
        />
        <PlayerRow
          name={away.name}
          probability={away.probability}
          odds={away.odds}
          highlighted={pickedSide === 'away'}
          colors={colors}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 10,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ color: colors.textSecondary, fontSize: 12, flex: 1, paddingRight: 8 }}
        >
          {reason || `Pick ${pickedName || 'TBD'}${otherName ? ` vs ${otherName}` : ''}`}
        </Text>
        {pickedProb != null && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: '700' }}>
              {Math.round(pickedProb)}%
              {pickedOdds ? ` · @${pickedOdds.toFixed(2)}` : ''}
            </Text>
          </View>
        )}
        {pickedProb == null && pickedOdds != null && (
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: '700' }}>
              @{pickedOdds.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function PlayerRow({
  name,
  probability,
  odds,
  highlighted,
  colors,
}: {
  name: string;
  probability: number | null;
  odds: number | null;
  highlighted: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: highlighted ? withAlpha(colors.primary, 0.12) : 'transparent',
        borderWidth: highlighted ? 1 : 0,
        borderColor: highlighted ? withAlpha(colors.primary, 0.35) : 'transparent',
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: highlighted ? colors.textPrimary : colors.textSecondary,
          fontSize: 14,
          fontWeight: highlighted ? '700' : '500',
          paddingRight: 8,
        }}
      >
        {name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {probability != null && (
          <Text
            style={{
              color: highlighted ? colors.textPrimary : colors.textMuted,
              fontSize: 13,
              fontWeight: highlighted ? '700' : '500',
              fontVariant: ['tabular-nums'],
            }}
          >
            {Math.round(probability)}%
          </Text>
        )}
        {odds != null && (
          <Text
            style={{
              color: highlighted ? colors.primary : colors.textSecondary,
              fontSize: 13,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
              minWidth: 42,
              textAlign: 'right',
            }}
          >
            {odds.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
}

function TierBadge({ tier, grade }: { tier: string | null; grade: string | null }) {
  const { colors } = useTheme();
  if (!tier && !grade) return null;
  const label = grade === 'elite'
    ? 'ELITE'
    : grade === 'strong'
      ? 'STRONG'
      : grade === 'safe'
        ? 'SAFE'
        : tier === 'top'
          ? 'TOP'
          : tier === 'confident'
            ? 'CONFIDENT'
            : tier === 'value'
              ? 'VALUE'
              : null;
  if (!label) return null;
  const Icon = grade === 'elite' ? Flame : grade === 'strong' ? Sparkle : Shield;
  const bg = grade === 'elite'
    ? '#f59e0b'
    : tier === 'top'
      ? colors.primary
      : tier === 'value'
        ? '#10b981'
        : colors.primary;
  const fg = '#ffffff';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: bg,
      }}
    >
      <Icon size={11} color={fg} strokeWidth={2.5} />
      <Text style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

function parseMatch(m: UpcomingMatch) {
  const homeName = m.home?.name ?? 'Home';
  const awayName = m.away?.name ?? 'Away';
  const leagueName = m.league?.name ?? 'League';
  const ts = Number(m.time);
  const timeLabel = Number.isFinite(ts) ? formatMatchTime(ts) : '';

  const mw = m.consolidatedPredictions?.matchWinner;
  const summary = m.consolidatedPredictions?.summary;
  const pq = summary?.pickQuality;
  const odds = m.odds?.matchWinner;

  const homeProb = toFiniteNumber(mw?.home_probability);
  const awayProb = toFiniteNumber(mw?.away_probability);
  const homeOdds = toFiniteNumber(odds?.home_od);
  const awayOdds = toFiniteNumber(odds?.away_od);

  // Prefer probability > 50 as the pick side; fall back to odds favorite.
  let pickedSide: 'home' | 'away' | null = null;
  if (homeProb != null && awayProb != null) {
    pickedSide = homeProb >= awayProb ? 'home' : 'away';
  } else if (odds?.favorite === 'home' || odds?.favorite === 'away') {
    pickedSide = odds.favorite;
  } else if (homeOdds != null && awayOdds != null) {
    pickedSide = homeOdds <= awayOdds ? 'home' : 'away';
  }

  const pickedProb = pickedSide === 'home' ? homeProb : pickedSide === 'away' ? awayProb : null;
  const pickedOdds = pickedSide === 'home' ? homeOdds : pickedSide === 'away' ? awayOdds : null;

  if (pickedSide == null) return null;

  return {
    leagueName,
    timeLabel,
    home: { name: homeName, probability: homeProb, odds: homeOdds },
    away: { name: awayName, probability: awayProb, odds: awayOdds },
    pickedSide,
    pickedName: pickedSide === 'home' ? homeName : awayName,
    otherName: pickedSide === 'home' ? awayName : homeName,
    pickedProb,
    pickedOdds,
    tier: (pq?.tier ?? null) as string | null,
    grade: (pq?.telegram_grade ?? null) as string | null,
    reason: pq?.reasons?.[0] ?? null,
  };
}

function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatMatchTime(ts: number): string {
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
  return `${day} · ${hh}:${mm}`;
}

function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
