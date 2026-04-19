import React from 'react';
import { Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop, G } from 'react-native-svg';

/**
 * Lossbeater brand mark — table tennis paddle on blue gradient tile.
 * Mirrors /public/logo-social.svg from tipster-ai web.
 */
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="lb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#137FEC" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>
      <Rect width={512} height={512} rx={96} fill="url(#lb-bg)" />
      <G transform="translate(106, 106) scale(12.5)" fill="white">
        <Path d="M19.52 2.49c-2.34-2.34-6.62-1.87-9.55 1.06-1.6 1.6-2.52 3.87-2.54 5.46-.02 1.58.26 3.89-1.35 5.5l-4.24 4.24 1.42 1.42 4.24-4.24c1.61-1.61 3.92-1.33 5.5-1.35 1.58-.02 3.86-.94 5.46-2.54 2.92-2.93 3.4-7.21 1.06-9.55zm-9.2 9.19c-1.53-1.53-1.05-4.61 1.06-6.72s5.18-2.59 6.72-1.06 1.05 4.61-1.06 6.72-5.19 2.59-6.72 1.06z" />
        <Circle cx={18} cy={18} r={3} />
      </G>
    </Svg>
  );
}

export function LogoWordmark({ color = '#f5f8fa', size = 18 }: { color?: string; size?: number }) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: '800',
        letterSpacing: -0.3,
      }}
    >
      Lossbeater
    </Text>
  );
}
