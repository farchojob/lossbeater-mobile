import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { BlurView } from 'expo-blur';
import { Home, Trophy, Users, Sparkles, Swords } from 'lucide-react-native';
import { useTheme } from '../../src/ui/theme/ThemeProvider';
import { TabBarIcon } from '../../src/ui/nav/TabBarIcon';
import { HapticTabBarButton } from '../../src/ui/nav/HapticTabBarButton';
import { useTranslations } from '../../src/i18n';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors, mode, systemScheme } = useTheme();
  const { t } = useTranslations('navigation');

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  const isDark = (mode === 'system' ? systemScheme : mode) === 'dark';
  const iosBlurTint = isDark ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            backgroundColor: 'transparent',
            elevation: 0,
          },
          default: {
            backgroundColor: colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
          },
        }),
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => (
                <BlurView
                  tint={iosBlurTint}
                  intensity={80}
                  style={StyleSheet.absoluteFill}
                />
              )
            : undefined,
        tabBarButton: (props) => <HapticTabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Home} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leagues"
        options={{
          title: t('leagues'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Trophy} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t('matches'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Swords} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: t('players'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Users} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parlay"
        options={{
          title: t('parlay'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Sparkles} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
