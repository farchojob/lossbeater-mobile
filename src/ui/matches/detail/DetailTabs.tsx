import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type DetailTabId = 'overview' | 'scores' | 'h2h' | 'chat';

interface TabItem {
  id: DetailTabId;
  label: string;
}

interface DetailTabsProps {
  active: DetailTabId;
  onChange: (id: DetailTabId) => void;
  tabs: TabItem[];
}

export function DetailTabs({ active, onChange, tabs }: DetailTabsProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceMuted,
        borderRadius: 12,
        padding: 4,
        gap: 2,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            hitSlop={4}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              borderRadius: 9,
              backgroundColor: isActive ? colors.primary : 'transparent',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              allowFontScaling={false}
              style={{
                color: isActive ? '#ffffff' : colors.textMuted,
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
