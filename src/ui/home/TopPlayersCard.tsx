import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { useTopPlayers, type PlayerOfDay, type PlayerOfDayMatch } from '../../api/useTopPlayers';

const PAGE_SIZE = 6;

export function TopPlayersCard({ onViewAll }: { onViewAll?: () => void }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const { data, loading, error } = useTopPlayers(30, 2);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const all = data?.players ?? [];
    return [...all]
      .filter((p) => p.total_matches >= 3)
      .sort((a, b) => b.win_rate - a.win_rate);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const safePage = page >= totalPages ? 0 : page;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        gap: 8,
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
          <Trophy size={12} color={colors.warning} strokeWidth={2.5} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '800',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {t('topPlayers.title')}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 10,
              fontWeight: '600',
              fontVariant: ['tabular-nums'],
            }}
          >
            {t('topPlayers.today')}
          </Text>
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
                {t('topPlayers.viewAll')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <HeaderRow />

      {loading && !data ? (
        <SkeletonRows />
      ) : error ? (
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {t('topPlayers.noData')}
        </Text>
      ) : sorted.length === 0 ? (
        <Text style={{ color: colors.textMuted, fontSize: 11, paddingVertical: 12 }}>
          {t('topPlayers.noData')}
        </Text>
      ) : (
        <View>
          {pageData.map((player, idx) => (
            <PlayerRow
              key={player.player_id}
              rank={safePage * PAGE_SIZE + idx + 1}
              player={player}
              last={idx === pageData.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function HeaderRow() {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <ColHead width={20} text={t('topPlayers.columns.rank')} />
      <ColHead flex={1.3} text={t('topPlayers.columns.player')} />
      <ColHead flex={1} text={t('topPlayers.columns.league')} />
      <ColHead width={42} align="right" text={t('topPlayers.columns.winRate')} />
      <ColHead width={60} align="right" text={t('topPlayers.columns.form')} />
    </View>
  );
}

function ColHead({
  text,
  width,
  flex,
  align = 'left',
}: {
  text: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'right';
}) {
  const { colors } = useTheme();
  return (
    <Text
      numberOfLines={1}
      style={{
        width,
        flex,
        color: colors.textMuted,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textAlign: align,
        paddingRight: align === 'left' ? 6 : 0,
      }}
    >
      {text}
    </Text>
  );
}

function PlayerRow({
  rank,
  player,
  last,
}: {
  rank: number;
  player: PlayerOfDay;
  last: boolean;
}) {
  const { colors } = useTheme();
  const league = primaryLeague(player.matches);
  const formDots = player.matches.slice(-5);
  const wrColor = winRateColor(player.win_rate, colors);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text
        style={{
          width: 20,
          color: colors.textMuted,
          fontSize: 11,
          fontWeight: '600',
          fontVariant: ['tabular-nums'],
        }}
      >
        {rank}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          flex: 1.3,
          color: colors.textPrimary,
          fontSize: 12,
          fontWeight: '700',
          paddingRight: 6,
        }}
      >
        {player.player_name}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '500',
          paddingRight: 6,
        }}
      >
        {league}
      </Text>
      <Text
        style={{
          width: 42,
          color: wrColor,
          fontSize: 12,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
        }}
      >
        {Math.round(player.win_rate)}%
      </Text>
      <View
        style={{
          width: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
        }}
      >
        {formDots.map((m, i) => (
          <View
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: m.won ? colors.success : colors.danger,
            }}
          />
        ))}
      </View>
    </View>
  );
}

function SkeletonRows() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            height: 18,
            borderRadius: 6,
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

function winRateColor(wr: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (wr >= 75) return colors.success;
  if (wr >= 60) return colors.warning;
  return colors.danger;
}

function primaryLeague(matches: PlayerOfDayMatch[]): string {
  const counts: Record<string, number> = {};
  for (const m of matches) {
    const name = m.league?.name;
    if (!name) continue;
    counts[name] = (counts[name] || 0) + 1;
  }
  let best = '';
  let max = 0;
  for (const [name, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      best = name;
    }
  }
  return best || '—';
}
