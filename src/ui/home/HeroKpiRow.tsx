import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type HeroKpi = {
  value: string;
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
};

export function HeroKpiRow({ kpis }: { kpis: HeroKpi[] }) {
  const { colors } = useTheme();
  const toneColor = (tone?: HeroKpi['tone']) => {
    if (tone === 'good') return colors.success;
    if (tone === 'warn') return colors.warning;
    if (tone === 'bad') return colors.danger;
    return colors.textPrimary;
  };
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {kpis.map((k, idx) => (
        <View key={`${k.label}-${idx}`} style={{ flex: 1, alignItems: 'flex-start', gap: 2 }}>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              color: toneColor(k.tone),
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.6,
              lineHeight: 24,
              fontVariant: ['tabular-nums'],
            }}
          >
            {k.value}
          </Text>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={{
              color: colors.textMuted,
              fontSize: 9,
              fontWeight: '800',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {k.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
