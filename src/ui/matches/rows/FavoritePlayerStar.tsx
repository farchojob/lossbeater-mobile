import React from 'react';
import { Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useUserFavorites } from '../../../api/useUserFavorites';

export function FavoritePlayerStar({
  playerId,
}: {
  playerId: string | number | null | undefined;
}) {
  const { colors } = useTheme();
  const { isFavoritePlayer, togglePlayer } = useUserFavorites();
  if (playerId == null) return null;
  const favorite = isFavoritePlayer(playerId);
  return (
    <Pressable
      onPress={() => togglePlayer(playerId)}
      hitSlop={8}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        paddingHorizontal: 2,
        paddingVertical: 2,
      })}
    >
      <Star
        size={12}
        color={favorite ? colors.warning : colors.textMuted}
        fill={favorite ? colors.warning : 'transparent'}
        strokeWidth={2}
      />
    </Pressable>
  );
}
