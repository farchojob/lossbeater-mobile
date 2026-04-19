// Palette mirroring tipster-ai web theme (globals.css).
// Light: Fresh Mint Stats — bg #f6f9fc, primary #137FEC
// Dark:  Blue-tinted — bg #101922, card #182430, primary #137FEC

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

// Brand blue — matches --primary: 210 85% 50%
export const brand: Record<Shade, string> = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#137FEC',
  600: '#0f6fd0',
  700: '#0d5fb3',
  800: '#0a4e92',
  900: '#083c72',
  950: '#052449',
};

// Slate neutrals used in the web dark theme (hsl 210 series)
export const slate: Record<Shade, string> = {
  50: '#f5f8fa',
  100: '#e5ebf0',
  200: '#cbd4dc',
  300: '#a6b3bf',
  400: '#7a8896',
  500: '#4a5668',
  600: '#2e3a46',
  700: '#243346',
  800: '#182430',
  900: '#141c26',
  950: '#0b131c',
};

// Semantic tokens (hex)
export const semantic = {
  danger: '#e5424d',
  success: '#10b981',
  warning: '#f59e0b',
} as const;
