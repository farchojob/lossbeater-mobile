import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { ALL_LEAGUES_ID } from '../../constants/leagues';
import { getLeagueSortKey } from '../../constants/leagueOrder';
import {
  useLiveMatchesInfinite,
  useUpcomingMatchesInfinite,
  useFinishedMatchesInfinite,
  type InfiniteListResult,
} from '../../api/useInfiniteMatches';
import { useUserFavorites } from '../../api/useUserFavorites';
import type { UpcomingMatch } from '../../api/types';
import type { LiveMatch } from '../../api/useLiveMatches';
import type { FinishedMatch } from '../../api/useFinishedToday';
import { LeagueFilterStrip } from './LeagueFilterStrip';
import { StatusTabs, type MatchStatus } from './StatusTabs';
import { LeagueGroupHeader } from './LeagueGroupHeader';
import { HowToModal } from './HowToModal';
import { SmartFiltersSheet } from './SmartFiltersSheet';
import type { SmartFilterId } from '../../constants/smartFilters';
import { LiveMatchRow } from './rows/LiveMatchRow';
import { ScheduledMatchRow } from './rows/ScheduledMatchRow';
import { FinishedMatchRow } from './rows/FinishedMatchRow';

const PAGE_SIZE = 40;

type AnyMatch = LiveMatch | UpcomingMatch | FinishedMatch;

type ListRow<T extends AnyMatch> =
  | { kind: 'header'; key: string; id: string; name: string; count: number }
  | { kind: 'match'; key: string; match: T; last: boolean };

export function MatchesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const [leagueId, setLeagueId] = useState<string>(ALL_LEAGUES_ID);
  const [status, setStatus] = useState<MatchStatus>('live');
  const [showHowTo, setShowHowTo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ReadonlyArray<SmartFilterId>>([]);

  const leagueFilter = leagueId === ALL_LEAGUES_ID ? null : leagueId;

  const live = useLiveMatchesInfinite(PAGE_SIZE, leagueFilter);
  const upcoming = useUpcomingMatchesInfinite(
    PAGE_SIZE,
    leagueFilter,
    null,
    activeFilters,
  );
  const finished = useFinishedMatchesInfinite(PAGE_SIZE);

  const finishedFiltered = useMemo(() => {
    if (!leagueFilter) return finished.items;
    return finished.items.filter(
      (m) => String(m.league?.id ?? '') === leagueFilter,
    );
  }, [finished.items, leagueFilter]);

  const normalizedQuery = query.trim().toLowerCase();
  const filterByQuery = <T extends AnyMatch>(items: T[]) =>
    normalizedQuery
      ? items.filter((m) => {
          const h = (m.home?.name ?? '').toLowerCase();
          const a = (m.away?.name ?? '').toLowerCase();
          return h.includes(normalizedQuery) || a.includes(normalizedQuery);
        })
      : items;

  const liveFiltered = useMemo(
    () => filterByQuery(live.items),
    [live.items, normalizedQuery],
  );
  const upcomingFiltered = useMemo(
    () => filterByQuery(upcoming.items),
    [upcoming.items, normalizedQuery],
  );
  const finishedSearchFiltered = useMemo(
    () => filterByQuery(finishedFiltered),
    [finishedFiltered, normalizedQuery],
  );

  const counts: Record<MatchStatus, number | null> = {
    live: live.total ?? (live.items.length || null),
    scheduled: upcoming.total ?? (upcoming.items.length || null),
    finished: leagueFilter ? finishedFiltered.length : finished.total,
  };

  const activeLeagueIds = useMemo<ReadonlySet<string> | null>(() => {
    const items: AnyMatch[] =
      status === 'live'
        ? live.items
        : status === 'finished'
        ? finished.items
        : [];
    if (items.length === 0) return null;
    const set = new Set<string>();
    for (const m of items) {
      const id = m.league?.id;
      if (id != null) set.add(String(id));
    }
    return set;
  }, [status, live.items, finished.items]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header
        onInfo={() => setShowHowTo(true)}
        onToggleSearch={() => {
          setSearchOpen((v) => !v);
          if (searchOpen) setQuery('');
        }}
        searchOpen={searchOpen}
        showFilters={status === 'scheduled'}
        filterCount={activeFilters.length}
        onOpenFilters={() => setShowFilters(true)}
      />
      {searchOpen && (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClose={() => {
            setSearchOpen(false);
            setQuery('');
          }}
        />
      )}
      <LeagueFilterStrip
        selected={leagueId}
        onChange={setLeagueId}
        status={status}
        activeLeagueIds={activeLeagueIds}
      />
      <StatusTabs value={status} counts={counts} onChange={setStatus} />
      {status === 'live' && (
        <StatusList
          state={{ ...live, items: liveFiltered }}
          showLeagueHeaders={!leagueFilter}
          emptyLabel={t('empty.live')}
          errorLabel={t('errors.loadFailed')}
          renderRow={(m, last) => (
            <LiveMatchRow key={m.id} match={m as LiveMatch} last={last} />
          )}
        />
      )}
      {status === 'scheduled' && (
        <StatusList
          state={{ ...upcoming, items: upcomingFiltered }}
          showLeagueHeaders={!leagueFilter}
          emptyLabel={t('empty.scheduled')}
          errorLabel={t('errors.loadFailed')}
          renderRow={(m, last) => (
            <ScheduledMatchRow
              key={m.id}
              match={m as UpcomingMatch}
              last={last}
            />
          )}
        />
      )}
      {status === 'finished' && (
        <StatusList
          state={{ ...finished, items: finishedSearchFiltered }}
          showLeagueHeaders={!leagueFilter}
          emptyLabel={t('empty.finished')}
          errorLabel={t('errors.loadFailed')}
          renderRow={(m, last) => (
            <FinishedMatchRow key={m.id} match={m as FinishedMatch} last={last} />
          )}
        />
      )}
      <HowToModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      <SmartFiltersSheet
        open={showFilters}
        active={activeFilters}
        onClose={() => setShowFilters(false)}
        onApply={setActiveFilters}
      />
    </SafeAreaView>
  );
}


function Header({
  onInfo,
  onToggleSearch,
  searchOpen,
  showFilters,
  filterCount,
  onOpenFilters,
}: {
  onInfo: () => void;
  onToggleSearch: () => void;
  searchOpen: boolean;
  showFilters: boolean;
  filterCount: number;
  onOpenFilters: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const filtersActive = filterCount > 0;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 8,
      }}
    >
      <Text
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: -0.3,
        }}
      >
        {t('title')}
      </Text>
      <IconButton onPress={onInfo} label="info">
        <Info size={20} color={colors.textSecondary} />
      </IconButton>
      {showFilters && (
        <IconButton onPress={onOpenFilters} label="filters" active={filtersActive}>
          <View>
            <SlidersHorizontal
              size={20}
              color={filtersActive ? colors.primary : colors.textSecondary}
            />
            {filtersActive && (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  minWidth: 14,
                  height: 14,
                  paddingHorizontal: 3,
                  borderRadius: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    color: colors.primaryText,
                    fontSize: 9,
                    fontWeight: '800',
                    lineHeight: 11,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {filterCount}
                </Text>
              </View>
            )}
          </View>
        </IconButton>
      )}
      <IconButton onPress={onToggleSearch} label="search" active={searchOpen}>
        {searchOpen ? (
          <X size={20} color={colors.primary} />
        ) : (
          <Search size={20} color={colors.textSecondary} />
        )}
      </IconButton>
    </View>
  );
}

function IconButton({
  onPress,
  children,
  label,
  active,
}: {
  onPress: () => void;
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? colors.surfaceMuted : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function SearchBar({
  value,
  onChangeText,
  onClose,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          height: 38,
          borderRadius: 10,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Search size={16} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textMuted}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          allowFontScaling={false}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: '600',
            paddingVertical: 0,
          }}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <X size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={onClose}
        hitSlop={6}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4 })}
      >
        <Text
          allowFontScaling={false}
          style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}
        >
          {t('search.close')}
        </Text>
      </Pressable>
    </View>
  );
}

function StatusList<T extends AnyMatch>({
  state,
  showLeagueHeaders,
  emptyLabel,
  errorLabel,
  renderRow,
}: {
  state: InfiniteListResult<T>;
  showLeagueHeaders: boolean;
  emptyLabel: string;
  errorLabel: string;
  renderRow: (item: T, last: boolean) => React.ReactNode;
}) {
  const { colors } = useTheme();
  const { isFavoriteLeague, isFavoritePlayer } = useUserFavorites();
  const { t } = useTranslations('matches');
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo<ListRow<T>[]>(
    () => buildRows(state.items, showLeagueHeaders, isFavoriteLeague, isFavoritePlayer),
    [state.items, showLeagueHeaders, isFavoriteLeague, isFavoritePlayer],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await state.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [state]);

  if (state.isLoading) {
    return <SkeletonList />;
  }
  if (state.isError && state.items.length === 0) {
    return <InlineMessage color={colors.textMuted}>{errorLabel}</InlineMessage>;
  }
  if (state.items.length === 0) {
    return <InlineMessage color={colors.textMuted}>{emptyLabel}</InlineMessage>;
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={rows}
      keyExtractor={(row) => row.key}
      renderItem={({ item }) => {
        if (item.kind === 'header') {
          return (
            <LeagueGroupHeader id={item.id} name={item.name} count={item.count} />
          );
        }
        return <>{renderRow(item.match, item.last)}</>;
      }}
      onEndReachedThreshold={0.4}
      onEndReached={() => state.loadMore()}
      initialNumToRender={25}
      maxToRenderPerBatch={20}
      windowSize={21}
      removeClippedSubviews={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={
        <ListFooter
          isLoadingMore={state.isLoadingMore}
          hasMore={state.hasMore}
          endLabel={t('endOfList')}
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    />
  );
}

function ListFooter({
  isLoadingMore,
  hasMore,
  endLabel,
}: {
  isLoadingMore: boolean;
  hasMore: boolean;
  endLabel: string;
}) {
  const { colors } = useTheme();
  if (isLoadingMore) {
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!hasMore) {
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>
          {endLabel}
        </Text>
      </View>
    );
  }
  return <View style={{ height: 20 }} />;
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

function buildRows<T extends AnyMatch>(
  items: T[],
  showHeaders: boolean,
  isFavoriteLeague: (id: string | number) => boolean,
  isFavoritePlayer: (id: string | number | null | undefined) => boolean,
): ListRow<T>[] {
  const hasFavPlayer = (m: T): boolean =>
    isFavoritePlayer(m.home?.id) || isFavoritePlayer(m.away?.id);

  const sortWithinGroup = (a: T, b: T): number => {
    const af = hasFavPlayer(a) ? 1 : 0;
    const bf = hasFavPlayer(b) ? 1 : 0;
    if (af !== bf) return bf - af;
    return 0;
  };

  if (!showHeaders) {
    const sorted = [...items].sort(sortWithinGroup);
    return sorted.map((m, idx) => ({
      kind: 'match',
      key: String(m.id),
      match: m,
      last: idx === sorted.length - 1,
    }));
  }

  const map = new Map<string, { id: string; name: string; items: T[] }>();
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

  const groups = order
    .map((id) => map.get(id)!)
    .sort((a, b) => {
      const af = isFavoriteLeague(a.id) ? 1 : 0;
      const bf = isFavoriteLeague(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      const ar = getLeagueSortKey(a.id);
      const br = getLeagueSortKey(b.id);
      if (ar !== br) return ar - br;
      return a.name.localeCompare(b.name);
    });

  const rows: ListRow<T>[] = [];
  for (const g of groups) {
    g.items.sort(sortWithinGroup);
    rows.push({
      kind: 'header',
      key: `h:${g.id}`,
      id: g.id,
      name: g.name,
      count: g.items.length,
    });
    g.items.forEach((m, idx) => {
      rows.push({
        kind: 'match',
        key: `m:${m.id}`,
        match: m,
        last: idx === g.items.length - 1,
      });
    });
  }
  return rows;
}
