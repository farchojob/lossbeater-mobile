import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Vote } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { useMostVoted, type MostVotedEntry } from '../../api/useMostVoted';

const PAGE_SIZE = 4;
const ACCENT = '#a78bfa';

export function VotingTendenciesCard({ onViewAll }: { onViewAll?: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const { data, loading, error } = useMostVoted(20, 1);
  const [page, setPage] = useState(0);

  const entries = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const all = data?.matches ?? [];
    return all.filter((e) => Number(e.match.time) > now);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage = page >= totalPages ? 0 : page;
  const pageData = entries.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

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
          <Vote size={12} color={ACCENT} strokeWidth={2.5} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {t('trendingVotes.title')}
          </Text>
          {entries.length > 0 && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: withAlpha(ACCENT, 0.14),
              }}
            >
              <Text
                style={{
                  color: ACCENT,
                  fontSize: 10,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {entries.length}
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
                {t('trendingVotes.viewAll')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading && !data ? (
        <SkeletonRows />
      ) : error ? (
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('trendingVotes.noVotes')}
        </Text>
      ) : entries.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 11, paddingVertical: 12 }}>
          {t('trendingVotes.noVotes')}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {pageData.map((entry, idx) => (
            <VoteRow
              key={entry.match.id}
              entry={entry}
              last={idx === pageData.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function VoteRow({ entry, last }: { entry: MostVotedEntry; last: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const { match, voteStats } = entry;
  const homeLead = voteStats.homePercentage > voteStats.awayPercentage;
  const awayLead = voteStats.awayPercentage > voteStats.homePercentage;
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
        {timeLabel ? (
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
        ) : null}
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: withAlpha(ACCENT, 0.14),
          }}
        >
          <Text
            style={{
              color: ACCENT,
              fontSize: 9,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {voteStats.totalVotes} {t('trendingVotes.columns.votes').toLowerCase()}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: homeLead ? colors.success : colors.textPrimary,
            fontSize: 12,
            fontWeight: homeLead ? '800' : '600',
            paddingRight: 8,
          }}
        >
          {match.home?.name ?? t('fallbacks.home')}
        </Text>
        <Text
          style={{
            width: 42,
            color: homeLead ? colors.success : colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
            textAlign: 'right',
          }}
        >
          {voteStats.homePercentage}%
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: awayLead ? colors.success : colors.textPrimary,
            fontSize: 12,
            fontWeight: awayLead ? '800' : '600',
            paddingRight: 8,
          }}
        >
          {match.away?.name ?? t('fallbacks.away')}
        </Text>
        <Text
          style={{
            width: 42,
            color: awayLead ? colors.success : colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
            textAlign: 'right',
          }}
        >
          {voteStats.awayPercentage}%
        </Text>
      </View>

      <ConsensusBar home={voteStats.homePercentage} away={voteStats.awayPercentage} />
    </View>
  );
}

function ConsensusBar({ home, away }: { home: number; away: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.surfaceMuted,
        overflow: 'hidden',
        flexDirection: 'row',
      }}
    >
      <View style={{ width: `${home}%`, backgroundColor: colors.success }} />
      <View style={{ width: `${away}%`, backgroundColor: colors.danger }} />
    </View>
  );
}

function SkeletonRows() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            height: 56,
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
