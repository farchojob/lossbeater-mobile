import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { LEAGUE_FLAGS } from '../../constants/leagues';
import { useUserFavorites } from '../../api/useUserFavorites';

export function LeagueGroupHeader({
  id,
  name,
  count,
}: {
  id: string;
  name: string;
  count: number;
}) {
  const { colors } = useTheme();
  const { isFavoriteLeague, toggleLeague } = useUserFavorites();
  const flag = LEAGUE_FLAGS[id];
  const favorite = isFavoriteLeague(id);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.surfaceMuted,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        gap: 8,
      }}
    >
      <Pressable
        onPress={() => toggleLeague(id)}
        hitSlop={6}
        style={({ pressed }) => ({
          padding: 2,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Star
          size={12}
          color={favorite ? colors.warning : colors.textMuted}
          fill={favorite ? colors.warning : 'transparent'}
          strokeWidth={2}
        />
      </Pressable>
      {flag && (
        <Text allowFontScaling={false} style={{ fontSize: 13, lineHeight: 15 }}>
          {flag}
        </Text>
      )}
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {name}
      </Text>
      <View
        style={{
          minWidth: 22,
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: 999,
          backgroundColor: colors.primary,
        }}
      >
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 10,
            fontWeight: '800',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
          }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}
