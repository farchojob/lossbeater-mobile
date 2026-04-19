export type Locale =
  | 'en'
  | 'es'
  | 'pt'
  | 'de'
  | 'fr'
  | 'it'
  | 'ru'
  | 'pl'
  | 'uk'
  | 'zh'
  | 'tr'
  | 'ja'
  | 'ko'
  | 'sv'
  | 'no'
  | 'da'
  | 'cs'
  | 'hi'
  | 'th'
  | 'vi';

export const LOCALES: Locale[] = [
  'en',
  'es',
  'pt',
  'de',
  'fr',
  'it',
  'ru',
  'pl',
  'uk',
  'zh',
  'tr',
  'ja',
  'ko',
  'sv',
  'no',
  'da',
  'cs',
  'hi',
  'th',
  'vi',
];

export const DEFAULT_LOCALE: Locale = 'en';

export type MessageValue = string | { [key: string]: MessageValue };
export type Messages = Record<string, MessageValue>;
