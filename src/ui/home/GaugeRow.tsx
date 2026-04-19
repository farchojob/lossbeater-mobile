import React from 'react';
import { View } from 'react-native';
import { Crown, Flame, Gem, Scale, Shield, Swords } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { GaugeCard } from './GaugeCard';
import type { StrategyPerformance } from '../../api/useStrategyPerformance';

const ICON_SIZE = 12;
const ICON_STROKE = 2.5;

export function PickQualityGauges({ data }: { data: StrategyPerformance | null }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const g = data?.grade_metrics;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <GaugeCard
        title={t('marketCards.gradeElite')}
        icon={<Crown size={ICON_SIZE} color={colors.warning} strokeWidth={ICON_STROKE} />}
        accuracy={g?.elite?.accuracy ?? 0}
        correct={g?.elite?.correct ?? 0}
        total={g?.elite?.total ?? 0}
        roi={g?.elite?.roi ?? null}
      />
      <GaugeCard
        title={t('marketCards.gradeStrong')}
        icon={<Shield size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />}
        accuracy={g?.strong?.accuracy ?? 0}
        correct={g?.strong?.correct ?? 0}
        total={g?.strong?.total ?? 0}
        roi={g?.strong?.roi ?? null}
      />
      <GaugeCard
        title={t('marketCards.gradeSafe')}
        icon={<Gem size={ICON_SIZE} color={colors.success} strokeWidth={ICON_STROKE} />}
        accuracy={g?.safe?.accuracy ?? 0}
        correct={g?.safe?.correct ?? 0}
        total={g?.safe?.total ?? 0}
        roi={g?.safe?.roi ?? null}
      />
    </View>
  );
}

export function OddsBucketGauges({ data }: { data: StrategyPerformance | null }) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const b = data?.odds_buckets;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <GaugeCard
        title={t('marketCards.oddsHeavy')}
        subtitle="≤1.60"
        icon={<Flame size={ICON_SIZE} color={colors.danger} strokeWidth={ICON_STROKE} />}
        accuracy={b?.heavy?.accuracy ?? 0}
        correct={b?.heavy?.correct ?? 0}
        total={b?.heavy?.total ?? 0}
      />
      <GaugeCard
        title={t('marketCards.oddsValue')}
        subtitle="1.60–2.00"
        icon={<Scale size={ICON_SIZE} color={colors.primary} strokeWidth={ICON_STROKE} />}
        accuracy={b?.value?.accuracy ?? 0}
        correct={b?.value?.correct ?? 0}
        total={b?.value?.total ?? 0}
      />
      <GaugeCard
        title={t('marketCards.oddsClose')}
        subtitle="≥2.00"
        icon={<Swords size={ICON_SIZE} color={colors.warning} strokeWidth={ICON_STROKE} />}
        accuracy={b?.close?.accuracy ?? 0}
        correct={b?.close?.correct ?? 0}
        total={b?.close?.total ?? 0}
      />
    </View>
  );
}
