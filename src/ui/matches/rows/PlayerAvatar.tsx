import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { menRed } from '../assets/menRed';
import { menBlue } from '../assets/menBlue';
import { womenRed } from '../assets/womenRed';
import { womenBlue } from '../assets/womenBlue';

type Side = 'home' | 'away';
type Size = 'sm' | 'md' | 'lg';

const DIMS: Record<Size, { box: number; svgW: number; svgH: number }> = {
  sm: { box: 16, svgW: 13, svgH: 16 },
  md: { box: 28, svgW: 23, svgH: 28 },
  lg: { box: 56, svgW: 46, svgH: 58 },
};

export function PlayerAvatar({
  side,
  leagueName,
  size = 'sm',
}: {
  side: Side;
  leagueName?: string | null;
  size?: Size;
}) {
  const women = isWomenLeague(leagueName ?? '');
  const xml = pickSvg(side, women);
  const dim = DIMS[size];
  const bg = side === 'home' ? 'rgba(255,49,49,0.12)' : 'rgba(60,120,255,0.15)';
  const border =
    side === 'home' ? 'rgba(255,49,49,0.35)' : 'rgba(60,120,255,0.35)';

  return (
    <View
      style={{
        width: dim.box,
        height: dim.box,
        borderRadius: dim.box / 2,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <SvgXml xml={xml} width={dim.svgW} height={dim.svgH} />
    </View>
  );
}

function pickSvg(side: Side, women: boolean): string {
  if (women) return side === 'home' ? womenRed : womenBlue;
  return side === 'home' ? menRed : menBlue;
}

function isWomenLeague(leagueName: string): boolean {
  return leagueName.toLowerCase().includes('women');
}
