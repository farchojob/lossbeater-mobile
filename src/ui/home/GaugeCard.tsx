import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title: string;
  icon?: React.ReactNode;
  accuracy: number;
  correct: number;
  total: number;
  subtitle?: string | null;
  roi?: number | null;
};

/**
 * Compact radial gauge card — replicates the web GaugeCard in `DashboardMarketCards`
 * with a stroked arc + centered percentage. Border-only elevation, no shadows.
 */
export function GaugeCard({
  title,
  icon,
  accuracy,
  correct,
  total,
  subtitle,
  roi,
}: Props) {
  const { colors } = useTheme();
  const accColor = thresholdColor(accuracy, colors);
  const hasData = total > 0;

  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 10,
        gap: 6,
        alignItems: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' }}>
        {icon}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: colors.textSecondary,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Text>
      </View>
      <Gauge value={hasData ? accuracy : 0} color={accColor} track={colors.border} />
      <View style={{ alignItems: 'center', gap: 1 }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
          }}
        >
          {hasData ? `${correct}/${total}` : '—'}
        </Text>
        {roi != null && (
          <Text
            style={{
              color: roiColor(roi, colors),
              fontSize: 10,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {roi >= 0 ? '+' : ''}
            {roi.toFixed(1)}% ROI
          </Text>
        )}
        {subtitle && (
          <Text
            numberOfLines={1}
            style={{
              color: colors.textMuted,
              fontSize: 9,
              fontWeight: '600',
              letterSpacing: 0.2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

function Gauge({ value, color, track }: { value: number; color: string; track: string }) {
  const { colors } = useTheme();
  const size = 64;
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: '800',
            letterSpacing: -0.3,
            fontVariant: ['tabular-nums'],
          }}
        >
          {value.toFixed(value < 10 ? 1 : 0)}%
        </Text>
      </View>
    </View>
  );
}

function thresholdColor(v: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (v >= 65) return colors.success;
  if (v >= 55) return colors.warning;
  return colors.danger;
}

function roiColor(v: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (v >= 5) return colors.success;
  if (v >= 0) return colors.warning;
  return colors.danger;
}
