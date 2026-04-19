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
};

export function PremiumGate({ tier, children }: Props) {
  const sub = useSubscription();
  if (sub.isLoading) return <>{children}</>;
  if (sub.hasAccess(tier)) return <>{children}</>;
  return <UpgradeCTA required={tier} />;
}

function UpgradeCTA({ required }: { required: Tier }) {
  const { colors } = useTheme();
  const { t } = useTranslations('subscription');
  const label = required === 'pro' ? t('requiresPro') : t('requiresPlus');
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Lock size={20} color={colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>
        {t('lockedTitle')}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 12,
          textAlign: 'center',
          maxWidth: 240,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => router.push('/(protected)/profile')}
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          opacity: pressed ? 0.85 : 1,
          marginTop: 4,
        })}
      >
        <Text style={{ color: colors.primaryText, fontSize: 12, fontWeight: '800' }}>
          {t('upgrade')}
        </Text>
      </Pressable>
    </View>
  );
}
