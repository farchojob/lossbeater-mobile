import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from '../src/ui/theme/ThemeProvider';
import { I18nProvider } from '../src/i18n';
import { SwrProvider } from '../src/api/swr';
import { applyInterFontPatch } from '../src/ui/theme/interFontPatch';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async removeToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

function RootStack() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (fontsLoaded) applyInterFontPatch();
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ThemeProvider>
          <I18nProvider>
            <SwrProvider>
              <RootStack />
            </SwrProvider>
          </I18nProvider>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
