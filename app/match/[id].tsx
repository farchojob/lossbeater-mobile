import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { useTranslations } from '../../src/i18n';
import { useMe } from '../../src/api/useMe';
import { useUpcomingMatchById, type AnyMatch } from '../../src/api/useMatchById';
import { PickQualityBadge } from '../../src/ui/matches/detail/PickQualityBadge';
import { DecisionSummary } from '../../src/ui/matches/detail/DecisionSummary';
import { H2HAnalysis } from '../../src/ui/matches/detail/H2HAnalysis';
import { MatchHero } from '../../src/ui/matches/detail/MatchHero';
import { DetailTabs, type DetailTabId } from '../../src/ui/matches/detail/DetailTabs';
import { MatchChatroom } from '../../src/ui/matches/detail/MatchChatroom';
import { MarketPills, type MarketId } from '../../src/ui/matches/detail/MarketPills';
import { MatchWinnerCard } from '../../src/ui/matches/detail/MatchWinnerCard';
import { FirstSetCard } from '../../src/ui/matches/detail/FirstSetCard';
import { OverUnderCard } from '../../src/ui/matches/detail/OverUnderCard';
import { HandicapCard } from '../../src/ui/matches/detail/HandicapCard';
import { TotalSetsCard } from '../../src/ui/matches/detail/TotalSetsCard';
import { CorrectScoreCard } from '../../src/ui/matches/detail/CorrectScoreCard';
import { HeaderZone } from '../../src/ui/common/HeaderZone';
import { SideDrawer } from '../../src/ui/common/SideDrawer';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const match = useUpcomingMatchById(id);
  const me = useMe();
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview');
  const [activeMarket, setActiveMarket] = useState<MarketId>('matchWinner');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const avatarUrl = clerkUser?.imageUrl ?? null;
  const initial = useMemo(() => {
    const name =
      me.data?.displayName || me.data?.nickname || clerkUser?.fullName || me.data?.email || '?';
    return String(name).trim().charAt(0).toUpperCase() || '?';
  }, [me.data, clerkUser]);

  const tabs: { id: DetailTabId; label: string }[] = [
    { id: 'overview', label: t('detail.tabs.overview') },
    { id: 'scores', label: t('detail.tabs.scores') },
    { id: 'h2h', label: t('detail.tabs.h2h') },
    { id: 'chat', label: t('detail.tabs.chat') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      {match ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          <HeaderZone>
            <TopBar
              title={match?.league?.name ?? ''}
              leagueId={match?.league?.id != null ? String(match.league.id) : ''}
              avatarUrl={avatarUrl}
              initial={initial}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
            <MatchHero match={match as unknown as Record<string, unknown>} />
          </HeaderZone>
          <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 14 }}>
            <DetailTabs active={activeTab} onChange={setActiveTab} tabs={tabs} />
            <TabContent
              tab={activeTab}
              match={match}
              activeMarket={activeMarket}
              onChangeMarket={setActiveMarket}
            />
          </View>
        </ScrollView>
      ) : (
        <>
          <TopBar
            title=""
            avatarUrl={avatarUrl}
            initial={initial}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>
              {t('detail.notFound')}
            </Text>
          </View>
        </>
      )}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}


function TabContent({
  tab,
  match,
  activeMarket,
  onChangeMarket,
}: {
  tab: DetailTabId;
  match: AnyMatch;
  activeMarket: MarketId;
  onChangeMarket: (id: MarketId) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  if (tab === 'overview') {
    return (
      <View style={{ gap: 12 }}>
        <MarketPills active={activeMarket} onChange={onChangeMarket} />
        <PickQualityBadge match={match} />
        {activeMarket === 'matchWinner' && (
          <MatchWinnerCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        {activeMarket === 'firstSet' && (
          <FirstSetCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        {activeMarket === 'overUnder' && (
          <OverUnderCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        {activeMarket === 'handicap' && (
          <HandicapCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        {activeMarket === 'totalSets' && (
          <TotalSetsCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        {activeMarket === 'correctScore' && (
          <CorrectScoreCard match={match as unknown as Record<string, unknown> & AnyMatch} />
        )}
        <DecisionSummary match={match} />
      </View>
    );
  }

  if (tab === 'scores') {
    const scores = (match as { scores?: Record<string, unknown> | null }).scores;
    const hasScores = !!scores && typeof scores === 'object' && Object.keys(scores).length > 0;
    return hasScores ? (
      <LiveSetGrid match={match} />
    ) : (
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: 20,
          alignItems: 'center',
        }}
      >
        <Text
          allowFontScaling={false}
          style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}
        >
          {t('detail.scores.empty')}
        </Text>
      </View>
    );
  }

  if (tab === 'h2h') {
    return <H2HAnalysis match={match} />;
  }

  const matchId = String((match as { id?: string | number }).id ?? '');
  return <MatchChatroom matchId={matchId} />;
}

function TopBar({
  title,
  leagueId = '',
  avatarUrl,
  initial,
  onOpenDrawer,
}: {
  title: string;
  leagueId?: string;
  avatarUrl?: string | null;
  initial?: string;
  onOpenDrawer?: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');
  const flag = resolveLeagueFlag(leagueId, title);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: 'transparent',
      }}
    >
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 6,
            paddingVertical: 6,
            borderRadius: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChevronLeft size={22} color={colors.textPrimary} />
          <Text
            allowFontScaling={false}
            style={{
              color: colors.textPrimary,
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 2,
            }}
          >
            {t('detail.back')}
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          flexShrink: 1,
        }}
      >
        {flag && (
          <Text allowFontScaling={false} style={{ fontSize: 13 }}>
            {flag}
          </Text>
        )}
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 12,
            fontWeight: '700',
            flexShrink: 1,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {onOpenDrawer && (
          <Pressable
            onPress={onOpenDrawer}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: avatarUrl ? colors.surfaceMuted : colors.primary,
              overflow: 'hidden',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 28, height: 28, borderRadius: 14 }} />
            ) : (
              <Text
                allowFontScaling={false}
                style={{ color: colors.primaryText, fontSize: 12, fontWeight: '800' }}
              >
                {initial ?? '?'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function resolveLeagueFlag(leagueId: string, leagueName: string): string | null {
  const byId: Record<string, string> = {
    '22742': '🇨🇿',
    '22307': '🇺🇦',
    '22121': '🇺🇦',
    '29097': '🇺🇦',
    '29128': '🇵🇱',
    '25065': '🇨🇿',
  };
  if (byId[leagueId]) return byId[leagueId];
  const n = leagueName.toLowerCase();
  if (n.includes('czech')) return '🇨🇿';
  if (n.includes('setka')) return '🇺🇦';
  if (n.includes('tt elite') || n.includes('elite series')) return '🇵🇱';
  if (n.includes('tt cup')) return '🇺🇦';
  if (n.includes('challenger')) return '🇨🇿';
  return null;
}

function LiveSetGrid({ match }: { match: AnyMatch }) {
  const { colors } = useTheme();
  const scores = (match as { scores?: Record<string, { home: string; away: string }> | null })
    .scores;
  if (!scores) return null;

  const entries = Object.entries(scores)
    .map(([k, v]) => [Number(k), v] as const)
    .filter(([n]) => Number.isFinite(n) && n > 0)
    .sort(([a], [b]) => a - b);
  if (entries.length === 0) return null;

  const currentSet =
    (match as { current_set?: number | null }).current_set ?? entries[entries.length - 1][0];
  const maxSet = Math.max(5, entries[entries.length - 1][0]);

  const homeName = match.home?.name ?? '—';
  const awayName = match.away?.name ?? '—';

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 12,
      }}
    >
      <View style={{ flexDirection: 'row', paddingBottom: 6, gap: 8 }}>
        <View style={{ flex: 1 }} />
        {Array.from({ length: maxSet }).map((_, i) => {
          const setNum = i + 1;
          const isCurrent = setNum === currentSet;
          return (
            <Text
              key={`h${setNum}`}
              allowFontScaling={false}
              style={{
                width: 24,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: '800',
                color: isCurrent ? colors.danger : colors.textMuted,
                fontVariant: ['tabular-nums'],
              }}
            >
              {setNum}
            </Text>
          );
        })}
      </View>

      <SetRow
        label={homeName}
        side="home"
        scores={scores}
        maxSet={maxSet}
        currentSet={currentSet}
      />
      <SetRow
        label={awayName}
        side="away"
        scores={scores}
        maxSet={maxSet}
        currentSet={currentSet}
      />
    </View>
  );
}

function SetRow({
  label,
  side,
  scores,
  maxSet,
  currentSet,
}: {
  label: string;
  side: 'home' | 'away';
  scores: Record<string, { home: string; away: string }>;
  maxSet: number;
  currentSet: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: 13,
          fontWeight: '700',
        }}
      >
        {label}
      </Text>
      {Array.from({ length: maxSet }).map((_, i) => {
        const setNum = i + 1;
        const entry = scores[String(setNum)];
        const raw = entry ? entry[side] : undefined;
        const num = raw == null ? null : Number(raw);
        const shown = num != null && Number.isFinite(num) ? String(num) : '—';
        const isCurrent = setNum === currentSet;
        const other = entry ? Number(side === 'home' ? entry.away : entry.home) : NaN;
        const me = num ?? NaN;
        const isWin =
          Number.isFinite(me) && Number.isFinite(other) && me >= 11 && me - other >= 2;
        const isLoss =
          Number.isFinite(me) && Number.isFinite(other) && other >= 11 && other - me >= 2;

        return (
          <Text
            key={`${side}${setNum}`}
            allowFontScaling={false}
            style={{
              width: 24,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: '800',
              color: isCurrent
                ? colors.danger
                : isWin
                  ? colors.success
                  : isLoss
                    ? colors.textMuted
                    : colors.textPrimary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {shown}
          </Text>
        );
      })}
    </View>
  );
}

