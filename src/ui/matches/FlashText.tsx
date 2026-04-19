import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, TextStyle } from 'react-native';

type Props = {
  value: string | number | undefined;
  baseBg?: string;
  flashBg: string;
  style?: StyleProp<TextStyle>;
  flashDurationMs?: number;
};

export function FlashText({ value, baseBg, flashBg, style, flashDurationMs = 900 }: Props) {
  const bgAnim = useRef(new Animated.Value(0)).current;
  const prev = useRef<string | number | undefined>(value);

  useEffect(() => {
    if (prev.current === value) return;
    const hadBefore = prev.current !== undefined && prev.current !== '' && prev.current !== '·';
    prev.current = value;
    if (!hadBefore) return;
    Animated.sequence([
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: flashDurationMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, bgAnim, flashDurationMs]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseBg ?? 'transparent', flashBg],
  });

  return (
    <Animated.Text allowFontScaling={false} style={[style, { backgroundColor }]}>
      {value ?? '·'}
    </Animated.Text>
  );
}
