import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function LeagueGroupHeader({ name, count }: { name: string; count: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.surfaceMuted,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {name}
      </Text>
      <View
        style={{
          minWidth: 22,
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: 999,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 10,
            fontWeight: '700',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
          }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}
