import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { brand, semantic, slate } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  borderStrong: string;
  danger: string;
  success: string;
  warning: string;
};

// Web light (.root): bg 210 40% 98%, card 0 0% 100%, primary #137FEC
const lightPalette: Palette = {
  background: '#f6f9fc',
  surface: '#ffffff',
  surfaceMuted: '#eef2f6',
  textPrimary: '#0f172a',
  textSecondary: '#4a5668',
  textMuted: '#7a8896',
  primary: brand[500],
  primaryText: '#ffffff',
  border: '#d4dbe0',
  borderStrong: '#b9c1c9',
  danger: semantic.danger,
  success: semantic.success,
  warning: semantic.warning,
};

// Web dark (.dark): bg 210 36% 10%, card 210 33% 14%, border 210 18% 22%
const darkPalette: Palette = {
  background: '#101922',
  surface: '#182430',
  surfaceMuted: '#1f2c38',
  textPrimary: slate[50],
  textSecondary: '#b0bcc8',
  textMuted: '#6b7d8f',
  primary: brand[500],
  primaryText: '#ffffff',
  border: slate[600],
  borderStrong: '#3d4f5f',
  danger: semantic.danger,
  success: semantic.success,
  warning: semantic.warning,
};

export type ThemeContextValue = {
  mode: ThemeMode;
  systemScheme: ColorSchemeName;
  colors: Palette;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'lossbeater_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const systemScheme = Appearance.getColorScheme();

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    })();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      if (mode === 'system') setModeState('system');
    });
    return () => sub.remove();
  }, [mode]);

  const effectiveScheme: ColorSchemeName = useMemo(
    () => (mode === 'system' ? Appearance.getColorScheme() : mode),
    [mode]
  );
  const colors = effectiveScheme === 'dark' ? darkPalette : lightPalette;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      systemScheme,
      colors,
      setMode: async (next: ThemeMode) => {
        setModeState(next);
        await SecureStore.setItemAsync(STORAGE_KEY, next);
      },
    }),
    [mode, systemScheme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
