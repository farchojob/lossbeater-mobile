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
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        padding: 3,
        alignItems: 'center',
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
              paddingVertical: 5,
              borderRadius: 7,
              backgroundColor: selected ? colors.primary : 'transparent',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: selected ? colors.primaryText : colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
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
