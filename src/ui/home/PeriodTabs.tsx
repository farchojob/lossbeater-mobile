import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';

export type PeriodOption = { value: number; labelKey: string };

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 0, labelKey: 'periods.today' },
  { value: 1, labelKey: 'periods.2d' },
  { value: 7, labelKey: 'periods.7d' },
  { value: 14, labelKey: 'periods.14d' },
  { value: 30, labelKey: 'periods.30d' },
];

export function PeriodTabs({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('dashboard');
  const isDark = colors.background === '#101922';
  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
  const inactiveText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.6)';
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: trackBg,
        borderRadius: 10,
        padding: 3,
        alignItems: 'center',
        gap: 2,
      }}
    >
      {PERIOD_OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => ({
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 7,
              backgroundColor: selected ? colors.primary : 'transparent',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: selected ? '#ffffff' : inactiveText,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.2,
              }}
            >
              {t(opt.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
