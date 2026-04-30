import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { useTranslations } from '../../src/i18n';
import { useMe } from '../../src/api/useMe';
import { useSubscription } from '../../src/api/useSubscription';
import { useStrategyPerformance } from '../../src/api/useStrategyPerformance';
import { PeriodTabs } from '../../src/ui/home/PeriodTabs';
import { accuracyTone, roiTone } from '../../src/ui/home/StatGrid';
import { HeroKpiRow, type HeroKpi } from '../../src/ui/home/HeroKpiRow';
import { HeaderZone } from '../../src/ui/common/HeaderZone';
import { SideDrawer } from '../../src/ui/common/SideDrawer';
import { OddsBucketGauges } from '../../src/ui/home/GaugeRow';
import { TopPlayersCard } from '../../src/ui/home/TopPlayersCard';
import { UpcomingPreviewCard } from '../../src/ui/home/UpcomingPreviewCard';
import { RecentResultsCard } from '../../src/ui/home/RecentResultsCard';
import { VotingTendenciesCard } from '../../src/ui/home/VotingTendenciesCard';

export default function Home() {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const [daysBack, setDaysBack] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const me = useMe();
  const sub = useSubscription();
  const perf = useStrategyPerformance(daysBack);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([me.refetch(), perf.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [me, perf]);

  const { user: clerkUser } = useUser();
  void sub;

  const fallbackName = t('fallbackName');
  const firstName = useMemo(() => {
    const name = me.data?.displayName || me.data?.nickname || me.data?.email || '';
    return String(name).split(/[\s@]/)[0] || fallbackName;
  }, [me.data, fallbackName]);
  const initial = firstName.charAt(0).toUpperCase();
  const avatarUrl = clerkUser?.imageUrl ?? null;

  const heroKpis = useMemo(() => buildHeroKpis(perf.data ?? null, t), [perf.data, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
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
        <HeaderZone>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 14 }}>
            <TopBar
              initial={initial}
              firstName={firstName}
              avatarUrl={avatarUrl}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
            <TitleRow daysBack={daysBack} setDaysBack={setDaysBack} />
            <HeroKpiRow kpis={heroKpis} />
          </View>
        </HeaderZone>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 16 }}>
          <SectionLabel title={t('sections.oddsBuckets')} />
          <OddsBucketGauges data={perf.data ?? null} />

          <TopPlayersCard onViewAll={() => router.push('/(protected)/matches')} />

          <UpcomingPreviewCard onViewAll={() => router.push('/(protected)/matches')} />

          <RecentResultsCard onViewAll={() => router.push('/(protected)/matches')} />

          <VotingTendenciesCard onViewAll={() => router.push('/(protected)/community')} />
        </View>
      </ScrollView>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

function TopBar({
  initial,
  firstName,
  avatarUrl,
  onOpenDrawer,
}: {
  initial: string;
  firstName: string;
  avatarUrl: string | null;
  onOpenDrawer: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        onPress={onOpenDrawer}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: avatarUrl ? colors.surfaceMuted : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
        ) : (
          <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: '800' }}>{initial}</Text>
        )}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.4,
          }}
        >
          {getGreeting(t).toUpperCase()}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700', letterSpacing: -0.2 }}
        >
          {firstName}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/(protected)/profile')}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 32,
          height: 32,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Bell size={16} color={colors.textSecondary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function TitleRow({
  daysBack,
  setDaysBack,
}: {
  daysBack: number;
  setDaysBack: (n: number) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text
        style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}
      >
        {t('title')}
      </Text>
      <PeriodTabs value={daysBack} onChange={setDaysBack} />
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginTop: 2,
      }}
    >
      {title}
    </Text>
  );
}

function buildHeroKpis(
  perf: ReturnType<typeof useStrategyPerformance>['data'],
  t: (key: string) => string,
): HeroKpi[] {
  const mw = perf?.markets?.match_winner;
  const em = perf?.edge_metrics;
  return [
    { value: fmtInt(perf?.total_matches), label: t('stats.analyzed') },
    { value: fmtPct(mw?.accuracy), label: t('stats.matchWin'), tone: accuracyTone(mw?.accuracy ?? 0) },
    { value: fmtRoi(em?.edge_roi), label: t('stats.edgeRoi'), tone: roiTone(em?.edge_roi ?? 0) },
  ];
}

function fmtInt(v: number | null | undefined): string {
  if (v == null) return '—';
  return v.toLocaleString();
}

function fmtPct(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v.toFixed(1)}%`;
}

function fmtRoi(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t('greeting.morning');
  if (h < 18) return t('greeting.afternoon');
  return t('greeting.evening');
}
