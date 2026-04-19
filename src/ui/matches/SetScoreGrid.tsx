import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type SetScore = { home: string; away: string };

type Tone = 'won' | 'lost' | 'current' | 'pending';

export function SetScoreGrid({
  homeSets,
  awaySets,
  homeSetWins,
  awaySetWins,
  liveSetIndex,
  totalColumn = true,
}: {
  homeSets: string[];
  awaySets: string[];
  homeSetWins: number;
  awaySetWins: number;
  liveSetIndex?: number | null;
  totalColumn?: boolean;
}) {
  const { colors } = useTheme();
  const cols = Math.max(homeSets.length, awaySets.length, 1);
  const homeLead = homeSetWins > awaySetWins;
  const awayLead = awaySetWins > homeSetWins;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: cols }).map((_, i) => {
        const h = homeSets[i];
        const a = awaySets[i];
        const isLive = liveSetIndex === i;
        return (
          <SetCell
            key={`s${i}`}
            home={h}
            away={a}
            homeTone={resolveTone(h, a, isLive, 'home')}
            awayTone={resolveTone(h, a, isLive, 'away')}
          />
        );
      })}
      {totalColumn && (
        <View
          style={{
            marginLeft: 4,
            paddingLeft: 6,
            minWidth: 18,
            borderLeftWidth: 1,
            borderLeftColor: colors.border,
          }}
        >
          <TotalCell value={homeSetWins} highlighted={homeLead} />
          <TotalCell value={awaySetWins} highlighted={awayLead} />
        </View>
      )}
    </View>
  );
}

function SetCell({
  home,
  away,
  homeTone,
  awayTone,
}: {
  home: string | undefined;
  away: string | undefined;
  homeTone: Tone;
  awayTone: Tone;
}) {
  return (
    <View style={{ minWidth: 18, paddingHorizontal: 2 }}>
      <ToneText tone={homeTone}>{home ?? '·'}</ToneText>
      <ToneText tone={awayTone}>{away ?? '·'}</ToneText>
    </View>
  );
}

function ToneText({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const { colors } = useTheme();
  const style = toneStyle(tone, colors);
  return (
    <Text
      allowFontScaling={false}
      style={{
        color: style.color,
        fontSize: 11,
        lineHeight: 14,
        fontWeight: style.weight,
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
        backgroundColor: style.bg,
        borderRadius: 3,
      }}
    >
      {children}
    </Text>
  );
}

function TotalCell({ value, highlighted }: { value: number; highlighted: boolean }) {
  const { colors } = useTheme();
  return (
    <Text
      allowFontScaling={false}
      style={{
        color: highlighted ? colors.textPrimary : colors.textMuted,
        fontSize: 12,
        lineHeight: 15,
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
      }}
    >
      {value}
    </Text>
  );
}

function resolveTone(
  home: string | undefined,
  away: string | undefined,
  isLive: boolean,
  side: 'home' | 'away',
): Tone {
  if (isLive) return 'current';
  if (home == null || away == null || home === '' || away === '') return 'pending';
  const h = Number(home);
  const a = Number(away);
  if (!Number.isFinite(h) || !Number.isFinite(a)) return 'pending';
  const mine = side === 'home' ? h : a;
  const theirs = side === 'home' ? a : h;
  if (mine > theirs) return 'won';
  if (mine < theirs) return 'lost';
  return 'pending';
}

function toneStyle(tone: Tone, colors: ReturnType<typeof useTheme>['colors']): {
  color: string;
  weight: '500' | '600' | '700' | '800';
  bg: string;
} {
  switch (tone) {
    case 'won':
      return { color: colors.success, weight: '800', bg: 'transparent' };
    case 'lost':
      return { color: colors.danger, weight: '600', bg: 'transparent' };
    case 'current':
      return { color: colors.textPrimary, weight: '800', bg: colors.surfaceMuted };
    case 'pending':
    default:
      return { color: colors.textMuted, weight: '600', bg: 'transparent' };
  }
}
