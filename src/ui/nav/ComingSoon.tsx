import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import type { TabIconComponent } from './TabBarIcon';

type Props = {
  Icon: TabIconComponent;
  title: string;
  subtitle: string;
};

export function ComingSoon({ Icon, title, subtitle }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={32} color={colors.primary} strokeWidth={2} />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 22,
            fontWeight: '700',
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </SafeAreaView>
  );
}
