import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

type Palette = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  border: string;
};

const lightPalette: Palette = {
  background: '#f7f7f9',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  primary: '#2563eb',
  primaryText: '#ffffff',
  border: '#e5e7eb',
};

const darkPalette: Palette = {
  background: '#0b1020',
  surface: '#121627',
  textPrimary: '#e5e7eb',
  textSecondary: '#9aa3b2',
  primary: '#60a5fa',
  primaryText: '#0b1020',
  border: '#23283a',
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
  const systemScheme = Appearance.getColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        // trigger re-render
        setModeState('system');
      }
    });
    return () => sub.remove();
  }, [mode]);

  const effectiveScheme: ColorSchemeName = useMemo(() => {
    if (mode === 'system') return Appearance.getColorScheme();
    return mode;
  }, [mode]);

  const colors = effectiveScheme === 'dark' ? darkPalette : lightPalette;

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    systemScheme,
    colors,
    setMode: async (next: ThemeMode) => {
      setModeState(next);
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    },
  }), [mode, systemScheme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
