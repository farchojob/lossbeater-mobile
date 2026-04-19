import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { ALL_LEAGUES_ID } from '../../constants/leagues';
import { getLeagueSortKey } from '../../constants/leagueOrder';
import { useLiveMatches, type LiveMatch } from '../../api/useLiveMatches';
import { useUpcomingPreview } from '../../api/useUpcomingPreview';
import { useFinishedToday, type FinishedMatch } from '../../api/useFinishedToday';
import type { UpcomingMatch } from '../../api/types';
import { LeagueFilterStrip } from './LeagueFilterStrip';
import { StatusTabs, type MatchStatus } from './StatusTabs';
import { LeagueGroupHeader } from './LeagueGroupHeader';
import { LiveMatchRow } from './rows/LiveMatchRow';
import { ScheduledMatchRow } from './rows/ScheduledMatchRow';
import { FinishedMatchRow } from './rows/FinishedMatchRow';

type AnyMatch = LiveMatch | UpcomingMatch | FinishedMatch;
type Group<T> = { id: string; name: string; items: T[] };

export function MatchesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const [leagueId, setLeagueId] = useState<string>(ALL_LEAGUES_ID);
  const [status, setStatus] = useState<MatchStatus>('live');

  const leagueFilter = leagueId === ALL_LEAGUES_ID ? null : leagueId;

  const live = useLiveMatches(80, leagueFilter);
  const upcoming = useUpcomingPreview(80, leagueFilter);
  const finished = useFinishedToday(80);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([live.refetch(), upcoming.refetch(), finished.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [live, upcoming, finished]);

  const finishedFiltered = useMemo(() => {
    const all = finished.data?.data ?? [];
    if (!leagueFilter) return all;
    return all.filter((m) => String(m.league?.id ?? '') === leagueFilter);
  }, [finished.data, leagueFilter]);

  const counts: Record<MatchStatus, number | null> = {
    live: live.data?.data?.length ?? null,
    scheduled: upcoming.data?.data?.length ?? null,
    finished: finishedFiltered.length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header />
      <LeagueFilterStrip selected={leagueId} onChange={setLeagueId} status={status} />
      <StatusTabs value={status} counts={counts} onChange={setStatus} />
      <ScrollView
        stickyHeaderIndices={[]}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {status === 'live' && (
          <StatusList
            data={live.data?.data ?? []}
            loading={live.isLoading && !live.data}
            error={!!live.error}
            emptyLabel={t('empty.live')}
            showLeagueHeaders={!leagueFilter}
            renderRow={(m, i, last) => <LiveMatchRow key={m.id} match={m as LiveMatch} last={last} />}
          />
        )}
        {status === 'scheduled' && (
          <StatusList
            data={upcoming.data?.data ?? []}
            loading={upcoming.isLoading && !upcoming.data}
            error={!!upcoming.error}
            emptyLabel={t('empty.scheduled')}
            showLeagueHeaders={!leagueFilter}
            renderRow={(m, i, last) => (
              <ScheduledMatchRow key={m.id} match={m as UpcomingMatch} last={last} />
            )}
          />
        )}
        {status === 'finished' && (
          <StatusList
            data={finishedFiltered}
            loading={finished.isLoading && !finished.data}
            error={!!finished.error}
            emptyLabel={t('empty.finished')}
            showLeagueHeaders={!leagueFilter}
            renderRow={(m, i, last) => (
              <FinishedMatchRow key={m.id} match={m as FinishedMatch} last={last} />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
      }}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: -0.3,
        }}
      >
        {t('title')}
      </Text>
    </View>
  );
}

function StatusList<T extends AnyMatch>({
  data,
  loading,
  error,
  emptyLabel,
  showLeagueHeaders,
  renderRow,
}: {
  data: T[];
  loading: boolean;
  error: boolean;
  emptyLabel: string;
  showLeagueHeaders: boolean;
  renderRow: (item: T, index: number, last: boolean) => React.ReactNode;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  if (loading) return <SkeletonList />;
  if (error) {
    return (
      <InlineMessage color={colors.textMuted}>{t('errors.loadFailed')}</InlineMessage>
    );
  }
  if (!data.length) {
    return <InlineMessage color={colors.textMuted}>{emptyLabel}</InlineMessage>;
  }

  if (!showLeagueHeaders) {
    return (
      <View>
        {data.map((item, idx) => renderRow(item, idx, idx === data.length - 1))}
      </View>
    );
  }

  const groups = groupByLeague(data);
  return (
    <View>
      {groups.map((g) => (
        <View key={g.id}>
          <LeagueGroupHeader name={g.name} count={g.items.length} />
          {g.items.map((item, idx) =>
            renderRow(item, idx, idx === g.items.length - 1),
          )}
        </View>
      ))}
    </View>
  );
}

function InlineMessage({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 13, fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

function SkeletonList() {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 16, gap: 8 }}>
      {[0, 1, 2, 3, 4].map((i) => (
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

function groupByLeague<T extends AnyMatch>(items: T[]): Group<T>[] {
  const map = new Map<string, Group<T>>();
  const order: string[] = [];

  for (const item of items) {
    const league = item.league ?? undefined;
    const rawId = league?.id != null ? String(league.id) : 'unknown';
    const name = league?.name ?? 'League';
    if (!map.has(rawId)) {
      map.set(rawId, { id: rawId, name, items: [] });
      order.push(rawId);
    }
    map.get(rawId)!.items.push(item);
  }

  return order
    .map((id) => map.get(id)!)
    .sort((a, b) => {
      const ar = getLeagueSortKey(a.id);
      const br = getLeagueSortKey(b.id);
      if (ar !== br) return ar - br;
      return a.name.localeCompare(b.name);
    });
}
