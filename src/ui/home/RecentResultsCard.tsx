import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, CheckSquare, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { useFinishedToday, type FinishedMatch } from '../../api/useFinishedToday';
import { useSubscription } from '../../api/useSubscription';

const PAGE_SIZE = 4;

type Outcome = 'win' | 'loss' | 'unknown';

export function RecentResultsCard({ onViewAll }: { onViewAll?: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const sub = useSubscription();
  const showOutcome = sub.isPlusOrAbove;
  const { data, isLoading: loading, error } = useFinishedToday(40);
  const [page, setPage] = useState(0);

  const withPredictions = useMemo(() => {
    const all = data?.data ?? [];
    return all.filter((m) => m.consolidatedPredictions?.matchWinner?.home_probability != null);
  }, [data]);

  const evaluated = useMemo(
    () =>
      withPredictions.map((m) => ({
        match: m,
        outcome: showOutcome ? evaluateOutcome(m) : ('unknown' as Outcome),
      })),
    [withPredictions, showOutcome],
  );

  const correctCount = evaluated.filter((e) => e.outcome === 'win').length;
  const gradedCount = evaluated.filter((e) => e.outcome !== 'unknown').length;

  const totalPages = Math.max(1, Math.ceil(evaluated.length / PAGE_SIZE));
  const safePage = page >= totalPages ? 0 : page;
  const pageData = evaluated.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CheckSquare size={12} color={colors.success} strokeWidth={2.5} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {t('recentResults.title')}
          </Text>
          {gradedCount > 0 && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: withAlpha(colors.success, 0.12),
              }}
            >
              <Text
                style={{
                  color: colors.success,
                  fontSize: 10,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {correctCount}/{gradedCount}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {totalPages > 1 && (
            <Pager
              page={safePage}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          )}
          {onViewAll && (
            <Pressable onPress={onViewAll} hitSlop={6}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                {t('recentResults.viewAll')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading && !data ? (
        <SkeletonRows />
      ) : error ? (
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('recentResults.noMatches')}
        </Text>
      ) : evaluated.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 11, paddingVertical: 12 }}>
          {t('recentResults.noMatches')}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {pageData.map((e, idx) => (
            <ResultRow
              key={e.match.id}
              match={e.match}
              outcome={e.outcome}
              last={idx === pageData.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ResultRow({
  match,
  outcome,
  last,
}: {
  match: FinishedMatch;
  outcome: Outcome;
  last: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const ss = parseSS(match.ss);
  const homeWon = ss ? ss.home > ss.away : false;
  const awayWon = ss ? ss.away > ss.home : false;

  const leagueName = match.league?.name ?? t('fallbacks.league');
  const timeLabel = formatMatchTime(Number(match.time));

  const borderColor =
    outcome === 'win' ? colors.success : outcome === 'loss' ? colors.danger : colors.border;

  return (
    <View
      style={{
        paddingLeft: 8,
        paddingBottom: last ? 0 : 10,
        borderLeftWidth: 2,
        borderLeftColor: borderColor,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: colors.textMuted,
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {leagueName}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 9,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
          }}
        >
          {timeLabel}
        </Text>
        <OutcomeBadge outcome={outcome} />
      </View>
      <PlayerLine
        name={match.home?.name ?? t('fallbacks.home')}
        score={ss?.home}
        won={homeWon}
        lost={awayWon}
      />
      <PlayerLine
        name={match.away?.name ?? t('fallbacks.away')}
        score={ss?.away}
        won={awayWon}
        lost={homeWon}
      />
    </View>
  );
}

function PlayerLine({
  name,
  score,
  won,
  lost,
}: {
  name: string;
  score: number | undefined;
  won: boolean;
  lost: boolean;
}) {
  const { colors } = useTheme();
  const color = won ? colors.success : lost ? colors.danger : colors.textPrimary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color,
          fontSize: 12,
          fontWeight: won ? '800' : '600',
          paddingRight: 8,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          width: 28,
          color,
          fontSize: 13,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
        }}
      >
        {score != null ? score : '—'}
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
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={11} color="#ffffff" strokeWidth={3} />
    </View>
  );
}

function SkeletonRows() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            height: 44,
            borderRadius: 8,
            backgroundColor: colors.surfaceMuted,
            opacity: 0.5,
          }}
        />
      ))}
    </View>
  );
}

function Pager({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '600',
          fontVariant: ['tabular-nums'],
        }}
      >
        {page + 1}/{totalPages}
      </Text>
      <Pressable onPress={onPrev} disabled={page === 0} hitSlop={6}>
        <ChevronLeft
          size={14}
          color={page === 0 ? colors.textMuted : colors.textSecondary}
          strokeWidth={2.5}
        />
      </Pressable>
      <Pressable onPress={onNext} disabled={page >= totalPages - 1} hitSlop={6}>
        <ChevronRight
          size={14}
          color={page >= totalPages - 1 ? colors.textMuted : colors.textSecondary}
          strokeWidth={2.5}
        />
      </Pressable>
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

function formatMatchTime(ts: number): string {
  if (!Number.isFinite(ts)) return '';
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
