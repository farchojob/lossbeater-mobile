import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export type StatCell = {
  value: string;
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
};

/**
 * Dense 8-cell KPI grid — mirrors tipster-ai web `DashboardStatStrip` density,
 * but wraps to 2 rows on mobile width so the numbers stay legible.
 */
export function StatGrid({ cells }: { cells: StatCell[] }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
      }}
    >
      {cells.map((cell, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const showRight = col < 3;
        const showBottom = row === 0 && cells.length > 4;
        return (
          <View
            key={`${cell.label}-${idx}`}
            style={{
              width: '25%',
              paddingVertical: 10,
              paddingHorizontal: 4,
              alignItems: 'center',
              borderRightWidth: showRight ? 1 : 0,
              borderRightColor: colors.border,
              borderBottomWidth: showBottom ? 1 : 0,
              borderBottomColor: colors.border,
              gap: 2,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: toneColor(cell.tone, colors),
                fontSize: 13,
                fontWeight: '800',
                letterSpacing: -0.2,
                fontVariant: ['tabular-nums'],
              }}
            >
              {cell.value}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: colors.textMuted,
                fontSize: 8,
                fontWeight: '700',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {cell.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function toneColor(
  tone: StatCell['tone'] | undefined,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (tone) {
    case 'good':
      return colors.success;
    case 'warn':
      return colors.warning;
    case 'bad':
      return colors.danger;
    default:
      return colors.textPrimary;
  }
}

export function accuracyTone(v: number): StatCell['tone'] {
  if (v >= 65) return 'good';
  if (v >= 55) return 'warn';
  return 'bad';
}

export function roiTone(v: number): StatCell['tone'] {
  if (v >= 5) return 'good';
  if (v >= 0) return 'warn';
  return 'bad';
}
