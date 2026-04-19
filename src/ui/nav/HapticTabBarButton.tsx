import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
  style,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={(e) => {
        if (Platform.OS === 'ios') {
          Haptics.selectionAsync();
        }
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true }}
      style={({ pressed }) => [
        { flex: 1, alignItems: 'center', justifyContent: 'center' },
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}
