import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { emerald } from './colors';

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
  background: '#f6f9ff',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  // emerald-500 to match web `--primary: 160 84% 39%`
  primary: emerald[500],
  primaryText: '#ffffff',
  border: '#e5e7eb',
};

// Emerald (shadcn-like) dark palette: near-black surfaces with emerald accents
const darkPalette: Palette = {
  // Exact colors requested
  background: '#1a1d23', // app background
  surface: '#1F2229',    // cards/surfaces
  textPrimary: '#e6e9ef',
  textSecondary: '#9aa3b2',
  primary: emerald[500],
  primaryText: '#031a13',
  border: '#2a2f3a',
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

  const effectiveScheme: ColorSchemeName = useMemo(() => (mode === 'system' ? Appearance.getColorScheme() : mode), [mode]);
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


