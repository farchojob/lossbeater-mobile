import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import type { Locale, Messages } from './types';
import { DEFAULT_LOCALE, LOCALES } from './types';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ru from './locales/ru.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';
import zh from './locales/zh.json';
import tr from './locales/tr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import cs from './locales/cs.json';
import hi from './locales/hi.json';
import th from './locales/th.json';
import vi from './locales/vi.json';

const messagesMap: Record<Locale, Messages> = {
  en,
  es,
  pt,
  de,
  fr,
  it,
  ru,
  pl,
  uk,
  zh,
  tr,
  ja,
  ko,
  sv,
  no,
  da,
  cs,
  hi,
  th,
  vi,
} as Record<Locale, Messages>;

const STORAGE_KEY = 'lossbeater_user_language';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveKey(messages: Messages, key: string): string {
  const parts = key.split('.');
  let current: unknown = messages;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    values[name] != null ? String(values[name]) : `{${name}}`,
  );
}

function detectDeviceLocale(): Locale {
  try {
    const detected = Localization.getLocales()[0]?.languageCode;
    if (detected && (LOCALES as string[]).includes(detected)) return detected as Locale;
  } catch {
    // expo-localization may not be available in some envs — fall through
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored && (LOCALES as string[]).includes(stored)) {
        setLocaleState(stored as Locale);
        return;
      }
      setLocaleState(detectDeviceLocale());
    })();
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await SecureStore.setItemAsync(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const result = resolveKey(messagesMap[locale], key);
      const resolved = result === key ? resolveKey(messagesMap.en, key) : result;
      return interpolate(resolved, values);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useTranslations(namespace?: string) {
  const { t, locale, setLocale } = useI18n();
  const nt = useCallback(
    (key: string, values?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return t(fullKey, values);
    },
    [t, namespace],
  );
  return { t: nt, locale, setLocale };
}
