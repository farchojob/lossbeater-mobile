import type { RibbonColor } from '../../constants/ribbonLogic';

export type RibbonAccent = {
  accent: string;
  tint: string;
};

export function getRibbonAccent(
  color: RibbonColor,
  primary: string,
): RibbonAccent {
  switch (color) {
    case 'red':
      return { accent: '#ef4444', tint: 'rgba(239,68,68,0.08)' };
    case 'blue':
      return { accent: primary, tint: 'rgba(19,127,236,0.08)' };
    case 'green':
      return { accent: '#16a34a', tint: 'rgba(22,163,74,0.08)' };
    case 'amber':
      return { accent: '#f97316', tint: 'rgba(249,115,22,0.08)' };
    case 'emerald':
      return { accent: '#10b981', tint: 'rgba(16,185,129,0.08)' };
    case 'cyan':
      return { accent: '#06b6d4', tint: 'rgba(6,182,212,0.08)' };
    case 'yellow':
      return { accent: '#eab308', tint: 'rgba(234,179,8,0.08)' };
    case 'orange':
      return { accent: '#f97316', tint: 'rgba(249,115,22,0.08)' };
    case 'purple':
      return { accent: '#a855f7', tint: 'rgba(168,85,247,0.08)' };
  }
}
