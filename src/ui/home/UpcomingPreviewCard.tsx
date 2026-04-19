import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { useUpcomingPreview } from '../../api/useUpcomingPreview';
import { useSubscription } from '../../api/useSubscription';
import type { UpcomingMatch } from '../../api/types';

const PAGE_SIZE = 4;

export function UpcomingPreviewCard({ onViewAll }: { onViewAll?: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const { data, isLoading: loading, error } = useUpcomingPreview(30);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const all = data?.data ?? [];
    return [...all]
      .filter((m) => Number(m.time) > now)
      .sort((a, b) => Number(a.time) - Number(b.time));
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = page >= totalPages ? 0 : page;
  const pageData = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

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
          <Clock size={12} color={colors.primary} strokeWidth={2.5} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {t('upcoming.title')}
          </Text>
          {sorted.length > 0 && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: withAlpha(colors.primary, 0.12),
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 10,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {sorted.length}
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
                {t('upcoming.viewAll')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading && !data ? (
        <SkeletonRows />
      ) : error ? (
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('upcoming.noMatches')}
        </Text>
      ) : pageData.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 11, paddingVertical: 12 }}>
          {t('upcoming.noMatches')}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {pageData.map((m, idx) => (
            <MatchRow key={m.id} match={m} last={idx === pageData.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

function MatchRow({ match, last }: { match: UpcomingMatch; last: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const mw = match.consolidatedPredictions?.matchWinner;
  const odds = match.odds?.matchWinner;
  const homeProb = toFiniteNumber(mw?.home_probability);
  const awayProb = homeProb != null ? 100 - homeProb : null;
  const homeOdds = toFiniteNumber(odds?.home_od);
  const awayOdds = toFiniteNumber(odds?.away_od);

  const homeFav = (homeProb ?? 0) > (awayProb ?? 0);
  const awayFav = (awayProb ?? 0) > (homeProb ?? 0);

  const leagueName = match.league?.name ?? t('fallbacks.league');
  const timeLabel = formatMatchTime(Number(match.time));

  return (
    <View
      style={{
        paddingBottom: last ? 0 : 10,
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
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: withAlpha(colors.primary, 0.12),
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 9,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
            }}
          >
            {timeLabel}
          </Text>
        </View>
      </View>
      <PlayerLine
        name={match.home?.name ?? t('fallbacks.home')}
        odd={homeOdds}
        prob={homeProb}
        other={awayOdds}
        highlighted={homeFav}
      />
      <PlayerLine
        name={match.away?.name ?? t('fallbacks.away')}
        odd={awayOdds}
        prob={awayProb}
        other={homeOdds}
        highlighted={awayFav}
      />
    </View>
  );
}

function PlayerLine({
  name,
  odd,
  prob,
  other,
  highlighted,
}: {
  name: string;
  odd: number | null;
  prob: number | null;
  other: number | null;
  highlighted: boolean;
}) {
  const { colors } = useTheme();
  const sub = useSubscription();
  const showProb = sub.isPlusOrAbove;
  const oddColor = oddsTone(odd, other, colors);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: highlighted ? colors.success : colors.textPrimary,
          fontSize: 12,
          fontWeight: highlighted ? '800' : '600',
          paddingRight: 8,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          width: 46,
          color: oddColor,
          fontSize: 11,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
        }}
      >
        {odd != null ? odd.toFixed(2) : '—'}
      </Text>
      <Text
        style={{
          width: 40,
          color: showProb ? (highlighted ? colors.success : colors.textMuted) : colors.textMuted,
          fontSize: 11,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
          opacity: showProb ? 1 : 0.35,
        }}
      >
        {showProb ? (prob != null ? `${Math.round(prob)}%` : '—') : '•••'}
      </Text>
    </View>
  );
}

function oddsTone(
  odd: number | null,
  other: number | null,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (odd == null || other == null) return colors.textMuted;
  if (odd < other) return colors.success;
  if (odd > other) return colors.danger;
  return colors.warning;
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

function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatMatchTime(ts: number): string {
  if (!Number.isFinite(ts)) return '';
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
  return `${day} ${hh}:${mm}`;
}

function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
