import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { ChevronLeft, LogOut, MessageCircle, Bell, CreditCard, Settings } from 'lucide-react-native';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { useMe } from '../../src/api/useMe';

export default function Profile() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { data } = useMe();

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const initial = (data?.displayName || data?.nickname || data?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase();
  const tier = (data?.entitlements?.tier as string | undefined) ?? 'free';
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 12,
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.25} />
        </Pressable>
        <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}>
          Account
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.primaryText, fontSize: 32, fontWeight: '700' }}>
              {initial}
            </Text>
          </View>
          <Text
            style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}
            numberOfLines={1}
          >
            {data?.displayName || data?.nickname || data?.email || 'Lossbeater User'}
          </Text>
          {data?.email ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>
              {data.email}
            </Text>
          ) : null}
          <View
            style={{
              marginTop: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: tier === 'free' ? colors.surfaceMuted : colors.primary,
            }}
          >
            <Text
              style={{
                color: tier === 'free' ? colors.textSecondary : colors.primaryText,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}
            >
              {tierLabel.toUpperCase()}
            </Text>
          </View>
        </View>

        <SettingsGroup colors={colors}>
          <SettingsRow Icon={CreditCard} label="Subscription" colors={colors} />
          <SettingsRow Icon={MessageCircle} label="Telegram Pro" colors={colors} />
          <SettingsRow Icon={Bell} label="Notifications" colors={colors} />
          <SettingsRow Icon={Settings} label="Preferences" colors={colors} last />
        </SettingsGroup>

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <LogOut size={18} color={colors.danger} strokeWidth={2.25} />
          <Text style={{ color: colors.danger, fontSize: 15, fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function SettingsRow({
  Icon,
  label,
  colors,
  last,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon size={18} color={colors.textSecondary} strokeWidth={2} />
      <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '500', flex: 1 }}>
        {label}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>Soon</Text>
    </Pressable>
  );
}
