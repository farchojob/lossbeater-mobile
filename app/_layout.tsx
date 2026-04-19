import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { ThemeProvider, useTheme } from '../src/ui/theme/ThemeProvider';
import { I18nProvider } from '../src/i18n';
import { SwrProvider } from '../src/api/swr';
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


