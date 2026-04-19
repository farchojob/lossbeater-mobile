import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';

export type MatchStatus = 'live' | 'scheduled' | 'finished';

export function StatusTabs({
  value,
  counts,
  onChange,
}: {
  value: MatchStatus;
  counts: Record<MatchStatus, number | null>;
  onChange: (next: MatchStatus) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('matches');

  const tabs: { id: MatchStatus; label: string }[] = [
    { id: 'live', label: t('tabs.live') },
    { id: 'scheduled', label: t('tabs.scheduled') },
    { id: 'finished', label: t('tabs.finished') },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          padding: 3,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.id === value;
          const count = counts[tab.id];
          const showLiveDot = tab.id === 'live' && (count ?? 0) > 0;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 7,
                borderRadius: 7,
                backgroundColor: active ? colors.primary : 'transparent',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {showLiveDot && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: active ? colors.primaryText : colors.danger,
                    }}
                  />
                )}
                <Text
                  style={{
                    color: active ? colors.primaryText : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  }}
                >
                  {tab.label}
                </Text>
                {count != null && count > 0 && (
                  <Text
                    style={{
                      color: active ? colors.primaryText : colors.textMuted,
                      fontSize: 11,
                      fontWeight: '700',
                      fontVariant: ['tabular-nums'],
                      opacity: active ? 0.85 : 1,
                    }}
                  >
                    {count}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
