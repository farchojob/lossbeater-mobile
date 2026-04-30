import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  Coins,
  Crown,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  X,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useMe } from '../../api/useMe';
import { useSubscription } from '../../api/useSubscription';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(280, Math.round(SCREEN_WIDTH * 0.74));

export function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const me = useMe();
  const sub = useSubscription();
  const insets = useSafeAreaInsets();

  const translate = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: -PANEL_WIDTH,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, translate, fade]);

  const name =
    me.data?.displayName || me.data?.nickname || user?.fullName || me.data?.email || 'Lossbeater User';
  const email = me.data?.email ?? user?.primaryEmailAddress?.emailAddress ?? '';
  const initial = String(name).trim().charAt(0).toUpperCase() || '?';
  const avatarUrl = user?.imageUrl ?? null;

  const balance = me.data?.coins?.balance ?? null;
  const balanceLabel = balance == null ? '—' : balance.toLocaleString();

  const tier = sub.tier;
  const tierActive = sub.isActive;
  const isPaid = tierActive && tier.toLowerCase() !== 'free';
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  const go = (path: string) => {
    onClose();
    setTimeout(() => router.push(path as never), 180);
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch {
      /* noop */
    }
  };

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          opacity: fade,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: PANEL_WIDTH,
          backgroundColor: colors.background,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          transform: [{ translateX: translate }],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingHorizontal: 10,
              paddingTop: 4,
            }}
          >
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <X size={16} color={colors.textSecondary} strokeWidth={2.25} />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 14, paddingTop: 2, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: avatarUrl ? colors.surfaceMuted : colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <Text
                    allowFontScaling={false}
                    style={{ color: colors.primaryText, fontSize: 16, fontWeight: '800' }}
                  >
                    {initial}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={{
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: '800',
                    letterSpacing: -0.2,
                  }}
                >
                  {name}
                </Text>
                {email ? (
                  <Text
                    numberOfLines={1}
                    allowFontScaling={false}
                    style={{ color: colors.textMuted, fontSize: 10, fontWeight: '500' }}
                  >
                    {email}
                  </Text>
                ) : null}
              </View>
            </View>

            <CoinsCard balance={balanceLabel} />

            <TierCard tierLabel={tierLabel} isPaid={isPaid} onPress={() => go('/(protected)/profile')} />
          </View>

          <View style={{ flex: 1, paddingHorizontal: 14, paddingTop: 10, gap: 2 }}>
            <NavRow
              Icon={UserIcon}
              label="Profile"
              onPress={() => go('/(protected)/profile')}
            />
            <NavRow
              Icon={SettingsIcon}
              label="Preferences"
              onPress={() => go('/(protected)/profile')}
            />
          </View>

          <View style={{ paddingHorizontal: 14, paddingBottom: 10 }}>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <LogOut size={13} color={colors.danger} strokeWidth={2.25} />
              <Text
                allowFontScaling={false}
                style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}
              >
                Sign out
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

function CoinsCard({ balance }: { balance: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        borderRadius: 10,
        paddingVertical: 9,
        paddingHorizontal: 10,
        backgroundColor: `${colors.warning}14`,
        borderWidth: 1,
        borderColor: `${colors.warning}40`,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: `${colors.warning}2A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Coins size={14} color={colors.warning} strokeWidth={2.3} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          Coins
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
            letterSpacing: -0.3,
          }}
        >
          {balance}
        </Text>
      </View>
    </View>
  );
}

function TierCard({
  tierLabel,
  isPaid,
  onPress,
}: {
  tierLabel: string;
  isPaid: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const accent = isPaid ? colors.primary : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 10,
        paddingVertical: 9,
        paddingHorizontal: 10,
        backgroundColor: isPaid ? `${colors.primary}14` : colors.surface,
        borderWidth: 1,
        borderColor: isPaid ? `${colors.primary}40` : colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isPaid ? `${colors.primary}2A` : colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Crown size={14} color={accent} strokeWidth={2.3} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textMuted,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          Plan
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {tierLabel}
        </Text>
      </View>
      {!isPaid && (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: colors.primary,
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: colors.primaryText,
              fontSize: 9,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}
          >
            UPGRADE
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function NavRow({
  Icon,
  label,
  onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 8,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      <Icon size={15} color={colors.textSecondary} strokeWidth={2.1} />
      <Text
        allowFontScaling={false}
        style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
