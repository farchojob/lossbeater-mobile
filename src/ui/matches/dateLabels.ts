import { useTranslations } from '../../i18n';

const LOCALE_BCP47: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  ru: 'ru-RU',
  pl: 'pl-PL',
  uk: 'uk-UA',
  zh: 'zh-CN',
  tr: 'tr-TR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  sv: 'sv-SE',
  no: 'nb-NO',
  da: 'da-DK',
  cs: 'cs-CZ',
  hi: 'hi-IN',
  th: 'th-TH',
  vi: 'vi-VN',
};

export function useLocaleBcp47(): string {
  const { locale } = useTranslations();
  return LOCALE_BCP47[locale] ?? 'en-US';
}

export function formatWeekdayShort(d: Date, bcp47: string): string {
  const raw = safeFormat(d, bcp47);
  return capitalize(raw.replace(/\./g, ''));
}

export function formatDayLabel(d: Date, bcp47: string): string {
  return `${formatWeekdayShort(d, bcp47)} ${d.getDate()}`;
}

export function formatHM(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function tsToDate(ts: number): Date | null {
  if (!Number.isFinite(ts)) return null;
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms);
}

function safeFormat(d: Date, bcp47: string): string {
  try {
    return d.toLocaleDateString(bcp47, { weekday: 'short' });
  } catch {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
}

function capitalize(s: string): string {
  if (!s.length) return s;
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}
