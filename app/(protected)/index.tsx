import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { useTranslations } from '../../src/i18n';
import { useMe } from '../../src/api/useMe';
import { useSubscription } from '../../src/api/useSubscription';
import { useStrategyPerformance } from '../../src/api/useStrategyPerformance';
import { PeriodTabs } from '../../src/ui/home/PeriodTabs';
import { StatGrid, accuracyTone, roiTone, type StatCell } from '../../src/ui/home/StatGrid';
import { PickQualityGauges, OddsBucketGauges } from '../../src/ui/home/GaugeRow';
import { TopPlayersCard } from '../../src/ui/home/TopPlayersCard';
import { UpcomingPreviewCard } from '../../src/ui/home/UpcomingPreviewCard';
import { RecentResultsCard } from '../../src/ui/home/RecentResultsCard';
import { VotingTendenciesCard } from '../../src/ui/home/VotingTendenciesCard';

export default function Home() {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const [daysBack, setDaysBack] = useState(0);

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

  const tierLabel = sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1);
  const tierActive = sub.isActive;

  const fallbackName = t('fallbackName');
  const firstName = useMemo(() => {
    const name = me.data?.displayName || me.data?.nickname || me.data?.email || '';
    return String(name).split(/[\s@]/)[0] || fallbackName;
  }, [me.data, fallbackName]);
  const initial = firstName.charAt(0).toUpperCase();

  const statCells = useMemo(() => buildStatCells(perf.data ?? null, t), [perf.data, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TopBar initial={initial} firstName={firstName} tier={tierLabel} tierActive={tierActive} />

        <TitleRow daysBack={daysBack} setDaysBack={setDaysBack} />

        <StatGrid cells={statCells} />

        <SectionLabel title={t('sections.pickQuality')} />
        <PickQualityGauges data={perf.data ?? null} />

        <SectionLabel title={t('sections.oddsBuckets')} />
        <OddsBucketGauges data={perf.data ?? null} />

        <TopPlayersCard onViewAll={() => router.push('/(protected)/matches')} />

        <UpcomingPreviewCard onViewAll={() => router.push('/(protected)/matches')} />

        <RecentResultsCard onViewAll={() => router.push('/(protected)/matches')} />

        <VotingTendenciesCard onViewAll={() => router.push('/(protected)/community')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopBar({
  initial,
  firstName,
  tier,
  tierActive,
}: {
  initial: string;
  firstName: string;
  tier: string;
  tierActive: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        onPress={() => router.push('/(protected)/profile')}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: colors.primaryText, fontSize: 14, fontWeight: '800' }}>{initial}</Text>
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
          style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 }}
        >
          {firstName}
        </Text>
      </View>
      <TierPill tier={tier} active={tierActive} />
      <Pressable
        onPress={() => router.push('/(protected)/profile')}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 34,
          height: 34,
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

function TierPill({ tier, active }: { tier: string; active: boolean }) {
  const { colors } = useTheme();
  const isPaid = active && tier.toLowerCase() !== 'free';
  const bg = isPaid ? colors.primary : colors.surfaceMuted;
  const fg = isPaid ? colors.primaryText : colors.textSecondary;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: isPaid ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: fg, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
        {tier.toUpperCase()}
      </Text>
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
        style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 }}
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

function buildStatCells(
  perf: ReturnType<typeof useStrategyPerformance>['data'],
  t: (key: string) => string,
): StatCell[] {
  const mw = perf?.markets?.match_winner;
  const tp = perf?.pick_quality?.top_pick;
  const cp = perf?.pick_quality?.confident_pick;
  const vbMw = perf?.value_bets?.match_winner;
  const vbOu = perf?.value_bets?.over_under;
  const em = perf?.edge_metrics;

  const vbTotal = (vbMw?.total ?? 0) + (vbOu?.total ?? 0);
  const vbCorrect = (vbMw?.correct ?? 0) + (vbOu?.correct ?? 0);
  const vbAcc = vbTotal > 0 ? (vbCorrect / vbTotal) * 100 : 0;

  const leagueCount = mw?.by_league?.length ?? 0;

  return [
    { value: fmtInt(perf?.total_matches), label: t('stats.analyzed') },
    { value: fmtPct(mw?.accuracy), label: t('stats.matchWin'), tone: accuracyTone(mw?.accuracy ?? 0) },
    { value: fmtPct(tp?.accuracy), label: t('stats.topPick'), tone: accuracyTone(tp?.accuracy ?? 0) },
    {
      value: fmtPct(cp?.accuracy),
      label: t('stats.confident'),
      tone: accuracyTone(cp?.accuracy ?? 0),
    },
    { value: fmtPct(vbAcc), label: t('stats.valueBet'), tone: accuracyTone(vbAcc) },
    {
      value: fmtPct(em?.edge_picks?.accuracy),
      label: t('stats.edgePicks'),
      tone: accuracyTone(em?.edge_picks?.accuracy ?? 0),
    },
    {
      value: fmtRoi(em?.edge_roi),
      label: t('stats.edgeRoi'),
      tone: roiTone(em?.edge_roi ?? 0),
    },
    { value: String(leagueCount), label: t('stats.leagues') },
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
