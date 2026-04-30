import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function HeaderZone({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const isDark = colors.background === '#101922';
  const zoneBg = isDark ? '#182a44' : '#d0e3fb';
  return (
    <View
      style={{
        backgroundColor: zoneBg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}
