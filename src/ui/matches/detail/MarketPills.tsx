import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowUpDown, BarChart3, Scale, Target, Trophy, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';

export type MarketId =
  | 'matchWinner'
  | 'firstSet'
  | 'overUnder'
  | 'handicap'
  | 'totalSets'
  | 'correctScore';

const MARKETS: { id: MarketId; Icon: LucideIcon }[] = [
  { id: 'matchWinner', Icon: Trophy },
  { id: 'firstSet', Icon: Zap },
  { id: 'overUnder', Icon: ArrowUpDown },
  { id: 'handicap', Icon: Scale },
  { id: 'totalSets', Icon: BarChart3 },
  { id: 'correctScore', Icon: Target },
];

interface Props {
  active: MarketId;
  onChange: (id: MarketId) => void;
}

export function MarketPills({ active, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingHorizontal: 2, paddingVertical: 2 }}
    >
      {MARKETS.map(({ id, Icon }) => {
        const isActive = id === active;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            hitSlop={4}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
              backgroundColor: isActive ? colors.primary : 'transparent',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Icon
              size={12}
              color={isActive ? colors.primaryText : colors.textMuted}
              strokeWidth={2.4}
            />
            <Text
              allowFontScaling={false}
              style={{
                color: isActive ? colors.primaryText : colors.textSecondary,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.2,
              }}
            >
              {t(`markets.${id}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
