import React from 'react';
import { Check, X } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useSubscription } from '../../../api/useSubscription';
import type { FinishedMatch } from '../../../api/useFinishedToday';
import { SetScoreGrid } from '../SetScoreGrid';

type Outcome = 'win' | 'loss' | 'unknown';

export function FinishedMatchRow({ match, last }: { match: FinishedMatch; last: boolean }) {
  const { colors } = useTheme();
  const sub = useSubscription();
  const showOutcome = sub.isPlusOrAbove;
  const ss = parseSS(match.ss);
  const homeWon = ss ? ss.home > ss.away : false;
  const awayWon = ss ? ss.away > ss.home : false;

  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';
  const outcome = showOutcome ? evaluateOutcome(match) : 'unknown';
  const time = formatTime(Number(match.time));

  const scoresObj = (match as FinishedMatch & { scores?: Record<string, { home: string; away: string }> })
    .scores;
  const scoreEntries = scoresObj
    ? Object.entries(scoresObj)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v)
    : [];
  const homeSets = scoreEntries.map((s) => String(s.home ?? ''));
  const awaySets = scoreEntries.map((s) => String(s.away ?? ''));

  const stripeColor =
    outcome === 'win' ? colors.success : outcome === 'loss' ? colors.danger : 'transparent';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingRight: 14,
        paddingLeft: 11,
        borderLeftWidth: 3,
        borderLeftColor: stripeColor,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      <View style={{ width: 44, alignItems: 'flex-start' }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 10,
            lineHeight: 13,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
          }}
        >
          {time}
        </Text>
        <OutcomeBadge outcome={outcome} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: homeWon ? colors.success : awayWon ? colors.textMuted : colors.textPrimary,
            fontSize: 12,
            lineHeight: 15,
            fontWeight: homeWon ? '800' : '600',
          }}
        >
          {homeName}
        </Text>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: awayWon ? colors.success : homeWon ? colors.textMuted : colors.textPrimary,
            fontSize: 12,
            lineHeight: 15,
            fontWeight: awayWon ? '800' : '600',
          }}
        >
          {awayName}
        </Text>
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
    </View>
  );
}

function FinalOnly({ homeSetWins, awaySetWins }: { homeSetWins: number; awaySetWins: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingHorizontal: 10 }}>
      <Text
        style={{
          color: homeSetWins > awaySetWins ? colors.success : colors.textPrimary,
          fontSize: 14,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        }}
      >
        {homeSetWins}
      </Text>
      <Text
        style={{
          color: awaySetWins > homeSetWins ? colors.success : colors.textPrimary,
          fontSize: 14,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        }}
      >
        {awaySetWins}
      </Text>
    </View>
  );
}

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { colors } = useTheme();
  if (outcome === 'unknown') return null;
  const bg = outcome === 'win' ? colors.success : colors.danger;
  const Icon = outcome === 'win' ? Check : X;
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
      }}
    >
      <Icon size={9} color="#ffffff" strokeWidth={3.5} />
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

function formatTime(ts: number): string {
  if (!Number.isFinite(ts)) return '—';
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}
