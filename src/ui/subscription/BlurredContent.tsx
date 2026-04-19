import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { useSubscription, type Tier } from '../../api/useSubscription';

type Props = {
  tier: Tier;
  children: React.ReactNode;
  feature?: string;
  compact?: boolean;
};

export function BlurredContent({ tier, children, feature, compact }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslations('subscription');
  const sub = useSubscription();
  if (sub.isLoading) return <>{children}</>;
  if (sub.hasAccess(tier)) return <>{children}</>;

  return (
    <View style={{ position: 'relative' }}>
      <View style={{ opacity: 0.28 }} pointerEvents="none">
        {children}
      </View>
      <Pressable
        onPress={() => router.push('/(protected)/profile')}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 4 : 6,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View
          style={{
            width: compact ? 28 : 36,
            height: compact ? 28 : 36,
            borderRadius: compact ? 14 : 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={compact ? 12 : 16} color={colors.primary} strokeWidth={2.5} />
        </View>
        {!compact && feature && (
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 11,
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            {feature}
          </Text>
        )}
        <Text
          style={{
            color: colors.primary,
            fontSize: compact ? 10 : 11,
            fontWeight: '700',
          }}
        >
          {tier === 'pro' ? t('requiresPro') : t('requiresPlus')}
        </Text>
      </Pressable>
    </View>
  );
}
