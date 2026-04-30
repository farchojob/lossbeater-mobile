import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Clock, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import { PlayerAvatar } from '../rows/PlayerAvatar';
import { useMatchVotes } from '../../../api/useMatchVotes';
import { useMe } from '../../../api/useMe';

const VOTE_COST = 50;

type AnyRec = Record<string, unknown>;
type Side = 'home' | 'away';

const AWAY_ORANGE = '#F97316';

interface MatchHeroProps {
  match: AnyRec;
}

export function MatchHero({ match }: MatchHeroProps) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  const matchId = match.id != null ? String(match.id) : '';
  const home = (match.home as { name?: string } | undefined)?.name ?? '—';
  const away = (match.away as { name?: string } | undefined)?.name ?? '—';
  const leagueObj = match.league as { id?: string | number; name?: string } | undefined;
  const league = leagueObj?.name ?? '';
  const timeStatus = String(match.time_status ?? '');
  const scores = match.scores as Record<string, { home: string; away: string }> | null | undefined;

  const status = resolveStatus(timeStatus, scores);
  const { homeSets, awaySets } = sumSets(scores);
  const ts = Number(match.time);
  const startTime = Number.isFinite(ts) ? formatStartTime(ts) : null;

  const odds = (match.odds as AnyRec | undefined)?.matchWinner as AnyRec | undefined;
  const homeOd = toNum(odds?.home_od);
  const awayOd = toNum(odds?.away_od);

  const homeColor = colors.primary;
  const awayColor = AWAY_ORANGE;

  const homeForm = extractFormArray(match, 'home', 10);
  const awayForm = extractFormArray(match, 'away', 10);
  const { homeWins: h2hHome, awayWins: h2hAway, total: h2hTotal } = extractH2H(match);

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        paddingTop: 2,
        paddingBottom: 12,
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 6,
        }}
      >
        <PlayerColumn name={home} side="home" leagueName={league} ringColor={homeColor} />
        <CenterColumn status={status} homeSets={homeSets} awaySets={awaySets} startTime={startTime} t={t} />
        <PlayerColumn name={away} side="away" leagueName={league} ringColor={awayColor} />
      </View>

      {(homeForm.length > 0 || awayForm.length > 0) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <FormColumn form={homeForm} />
          <View style={{ width: 96 }} />
          <FormColumn form={awayForm} />
        </View>
      )}

      <View style={{ alignItems: 'center', gap: 10 }}>
        <Separator />
        <View style={{ width: '72%', gap: 10 }}>
          <VoteRow
            matchId={matchId}
            matchTime={ts}
            leagueName={league}
            homeOdd={homeOd}
            awayOdd={awayOd}
            homeColor={homeColor}
            awayColor={awayColor}
            disabled={status.kind !== 'scheduled'}
          />
          {h2hTotal > 0 && (
            <H2HBar
              home={h2hHome}
              away={h2hAway}
              total={h2hTotal}
              homeColor={homeColor}
              awayColor={awayColor}
              label={t('detail.h2hBar.label', { shown: String(h2hHome + h2hAway), total: String(h2hTotal) })}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Separator() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: '48%',
        height: 1,
        backgroundColor: colors.border,
        opacity: 0.6,
        marginTop: 2,
      }}
    />
  );
}

function PlayerColumn({
  name,
  side,
  leagueName,
  ringColor,
}: {
  name: string;
  side: Side;
  leagueName: string;
  ringColor: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 5 }}>
      <View
        style={{
          padding: 2,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: ringColor,
        }}
      >
        <PlayerAvatar side={side} leagueName={leagueName} size="md" />
      </View>
      <Text
        numberOfLines={2}
        allowFontScaling={false}
        style={{
          color: colors.textPrimary,
          fontSize: 13,
          fontWeight: '800',
          textAlign: 'center',
          lineHeight: 15,
          letterSpacing: -0.2,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

function CenterColumn({
  status,
  homeSets,
  awaySets,
  startTime,
  t,
}: {
  status: Status;
  homeSets: number;
  awaySets: number;
  startTime: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const { colors } = useTheme();
  const showScore = status.kind !== 'scheduled';

  return (
    <View style={{ width: 96, alignItems: 'center', paddingTop: 4, gap: 6 }}>
      {showScore ? (
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 30,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
            letterSpacing: -0.8,
            lineHeight: 32,
          }}
        >
          {homeSets} – {awaySets}
        </Text>
      ) : (
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: '900',
            letterSpacing: 0.5,
          }}
        >
          VS
        </Text>
      )}

      {status.kind === 'live' && (
        <StatusChip
          icon={null}
          label={t('set').replace('{n}', String(status.currentSet))}
          fg={colors.danger}
          bg={`${colors.danger}1A`}
          border={`${colors.danger}40`}
          pulse
        />
      )}
      {status.kind === 'finished' && (
        <StatusChip
          icon={null}
          label={t('detail.status.finished')}
          fg={colors.success}
          bg={`${colors.success}1A`}
          border={`${colors.success}40`}
        />
      )}
      {status.kind === 'scheduled' && startTime && (
        <StatusChip
          icon={<Clock size={8} color={colors.primary} strokeWidth={2.5} />}
          label={startTime}
          fg={colors.primary}
          bg={`${colors.primary}1A`}
          border={`${colors.primary}40`}
        />
      )}
    </View>
  );
}

function StatusChip({
  icon,
  label,
  fg,
  bg,
  border,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  fg: string;
  bg: string;
  border: string;
  pulse?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      {pulse && (
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: fg }} />
      )}
      {icon}
      <Text
        allowFontScaling={false}
        style={{
          color: fg,
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          fontVariant: ['tabular-nums'],
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function FormColumn({ form }: { form: boolean[] }) {
  const { colors } = useTheme();
  if (form.length === 0) return <View style={{ flex: 1 }} />;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {form.map((won, i) => (
          <View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: won ? colors.success : colors.danger,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function VoteRow({
  matchId,
  matchTime,
  leagueName: _leagueName,
  homeOdd,
  awayOdd,
  homeColor,
  awayColor,
  disabled,
}: {
  matchId: string;
  matchTime: number;
  leagueName: string;
  homeOdd: number | null;
  awayOdd: number | null;
  homeColor: string;
  awayColor: string;
  disabled: boolean;
}) {
  const { colors } = useTheme();
  const me = useMe();
  const balance = me.data?.coins?.balance ?? null;
  const { stats, userVote, castVote, clearVote, casting, error, refetch } = useMatchVotes(
    matchId || null,
    Number.isFinite(matchTime) ? matchTime : null,
  );
  const homePct = stats?.homePercentage ?? null;
  const awayPct = stats?.awayPercentage ?? null;
  const hasStats = stats && stats.totalVotes > 0;
  const canAfford = balance == null || balance >= VOTE_COST;
  const hasVote = userVote != null;

  const handlePress = async (side: 'home' | 'away') => {
    if (disabled || casting) return;
    try {
      if (userVote === side) {
        await clearVote();
      } else if (userVote != null) {
        await clearVote();
        await castVote(side);
      } else {
        if (!canAfford) return;
        await castVote(side);
      }
      me.refetch();
      refetch();
    } catch {
      /* error state surfaces via helper text below */
    }
  };

  const helper = error
    ? error.message || 'Could not update vote'
    : !hasVote && !canAfford
      ? `Need ${VOTE_COST} coins to vote`
      : hasVote
        ? 'Tap again to undo · tap the other side to switch'
        : `${VOTE_COST} coins per vote`;
  const helperIsError = error != null;

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <VoteButton
          accent={homeColor}
          odd={homeOdd}
          percentage={hasStats ? homePct : null}
          selected={userVote === 'home'}
          otherSelected={userVote === 'away'}
          disabled={disabled || casting || (!hasVote && !canAfford)}
          onPress={() => handlePress('home')}
        />
        <VoteButton
          accent={awayColor}
          odd={awayOdd}
          percentage={hasStats ? awayPct : null}
          selected={userVote === 'away'}
          otherSelected={userVote === 'home'}
          disabled={disabled || casting || (!hasVote && !canAfford)}
          onPress={() => handlePress('away')}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {hasVote && (
          <RotateCcw size={9} color={colors.textMuted} strokeWidth={2.4} />
        )}
        <Text
          allowFontScaling={false}
          style={{
            color: helperIsError || (!hasVote && !canAfford) ? colors.danger : colors.textMuted,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.3,
            textAlign: 'center',
          }}
        >
          {helper}
        </Text>
      </View>
    </View>
  );
}

function VoteButton({
  accent,
  odd,
  percentage,
  selected,
  otherSelected,
  disabled,
  onPress,
}: {
  accent: string;
  odd: number | null;
  percentage: number | null;
  selected: boolean;
  otherSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const oddColor = '#ffffff';
  const pctColor = 'rgba(255,255,255,0.78)';
  const opacity = disabled && !selected ? 0.55 : otherSelected ? 0.6 : 1;
  const borderColor = selected ? '#ffffff' : accent;
  const borderWidth = selected ? 2 : 1;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: accent,
        borderWidth,
        borderColor,
        opacity: pressed ? opacity * 0.85 : opacity,
      })}
    >
      <Text
        allowFontScaling={false}
        style={{
          color: oddColor,
          fontSize: 13,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.2,
        }}
      >
        {odd != null ? odd.toFixed(2) : '—'}
      </Text>
      {percentage != null && (
        <Text
          allowFontScaling={false}
          style={{
            color: pctColor,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.2,
            fontVariant: ['tabular-nums'],
          }}
        >
          · {percentage}%
        </Text>
      )}
    </Pressable>
  );
}

function H2HBar({
  home,
  away,
  total,
  homeColor,
  awayColor,
  label,
}: {
  home: number;
  away: number;
  total: number;
  homeColor: string;
  awayColor: string;
  label: string;
}) {
  const { colors } = useTheme();
  const shown = home + away;
  const homeFlex = shown > 0 ? home : 1;
  const awayFlex = shown > 0 ? away : 1;
  return (
    <View style={{ gap: 4, paddingTop: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          H2H
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            flex: 1,
            textAlign: 'left',
            marginLeft: 6,
            color: homeColor,
            fontSize: 11,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {home}
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: awayColor,
            fontSize: 11,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
          }}
        >
          {away}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <View style={{ flex: homeFlex, backgroundColor: homeColor }} />
        <View style={{ flex: awayFlex, backgroundColor: awayColor }} />
      </View>
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 9,
          fontWeight: '600',
          textAlign: 'center',
          letterSpacing: 0.2,
        }}
      >
        {label} · {total}
      </Text>
    </View>
  );
}

type Status =
  | { kind: 'live'; currentSet: number }
  | { kind: 'finished' }
  | { kind: 'scheduled' };

function resolveStatus(
  timeStatus: string,
  scores: Record<string, { home: string; away: string }> | null | undefined,
): Status {
  if (timeStatus === '1' || (timeStatus !== '3' && scores && Object.keys(scores).length > 0)) {
    const setKeys = scores
      ? Object.keys(scores).map((k) => Number(k)).filter((n) => Number.isFinite(n) && n > 0)
      : [];
    const currentSet = setKeys.length > 0 ? Math.max(...setKeys) : 1;
    return { kind: 'live', currentSet };
  }
  if (timeStatus === '3') return { kind: 'finished' };
  return { kind: 'scheduled' };
}

function sumSets(scores: Record<string, { home: string; away: string }> | null | undefined) {
  if (!scores) return { homeSets: 0, awaySets: 0 };
  let homeSets = 0;
  let awaySets = 0;
  for (const [, v] of Object.entries(scores)) {
    const h = Number(v?.home);
    const a = Number(v?.away);
    if (!Number.isFinite(h) || !Number.isFinite(a)) continue;
    if (h >= 11 && h - a >= 2) homeSets += 1;
    else if (a >= 11 && a - h >= 2) awaySets += 1;
  }
  return { homeSets, awaySets };
}

function formatStartTime(ts: number): string {
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function extractFormArray(match: AnyRec, side: Side, maxDots: number): boolean[] {
  const ps = (match.player_stats as AnyRec | undefined) ?? {};
  const sideStats = (ps[side] as AnyRec | undefined) ?? {};
  const temporal = (sideStats.temporal as AnyRec | undefined) ?? {};

  const order = ['last10', 'last20', 'last5', 'last50'];
  for (const w of order) {
    const window = temporal[w] as AnyRec | undefined;
    const recent = window?.recentForm;
    if (typeof recent === 'string' && recent.length > 0) {
      return recent
        .split('')
        .slice(0, maxDots)
        .map((c) => c === 'W' || c === '1')
        .reverse();
    }
  }

  const fallbackStr = sideStats.recentForm;
  if (typeof fallbackStr === 'string' && fallbackStr.length > 0) {
    return fallbackStr
      .split('')
      .slice(0, maxDots)
      .map((c) => c === 'W' || c === '1')
      .reverse();
  }
  if (Array.isArray(fallbackStr)) {
    return fallbackStr.slice(-maxDots).map((v) => v === 1 || v === true);
  }

  const prf = (match.playersRecentForm as AnyRec | undefined) ?? {};
  const arr = prf[side];
  if (Array.isArray(arr)) {
    return arr.slice(-maxDots).map((v) => v === 1 || v === true);
  }
  return [];
}

function extractH2H(match: AnyRec): { homeWins: number; awayWins: number; total: number } {
  const ta = (match.tipster_analysis as AnyRec | undefined) ?? {};
  const tc = (ta.temporal_comparison as AnyRec | undefined) ?? {};
  const tcWindows = (tc.windows as AnyRec | undefined) ?? {};
  const h2hSummary = (ta.h2h_summary as AnyRec | undefined) ?? {};
  const homeIsPlayerA = (h2hSummary.home_is_player_a as boolean | undefined) ?? true;

  const priority = ['last10', 'last20', 'last50', 'last100', 'last5', 'all_time'];
  for (const w of priority) {
    const wd = tcWindows[w] as AnyRec | undefined;
    const r = wd?.results as AnyRec | undefined;
    if (!r) continue;
    const aWon = Number(r.player_a_won ?? 0);
    const bWon = Number(r.player_b_won ?? 0);
    const total = aWon + bWon;
    if (total <= 0) continue;
    const homeWins = homeIsPlayerA ? aWon : bWon;
    const awayWins = homeIsPlayerA ? bWon : aWon;
    const allTimeTotal = Number((tcWindows.all_time as AnyRec | undefined)?.totalMatches ?? total);
    return { homeWins, awayWins, total: Math.max(total, allTimeTotal) };
  }
  return { homeWins: 0, awayWins: 0, total: 0 };
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

