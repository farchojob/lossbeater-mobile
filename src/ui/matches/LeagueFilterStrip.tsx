import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTranslations } from '../../i18n';
import { ALL_LEAGUES_ID, LEAGUE_FLAGS } from '../../constants/leagues';
import { getLeagueSortKey } from '../../constants/leagueOrder';
import { useLeagues, type ActiveLeague } from '../../api/useLeagues';
import { useUserFavorites } from '../../api/useUserFavorites';
import type { MatchStatus } from './StatusTabs';

const STRIP_HEIGHT = 46;
const PILL_HEIGHT = 32;

type Props = {
  selected: string;
  onChange: (id: string) => void;
  status: MatchStatus;
  activeLeagueIds?: ReadonlySet<string> | null;
};

export function LeagueFilterStrip({
  selected,
  onChange,
  status,
  activeLeagueIds,
}: Props) {
  const { t } = useTranslations('matches');
  const { leagues } = useLeagues();
  const { isFavoriteLeague, toggleLeague } = useUserFavorites();

  const countKey: keyof Pick<ActiveLeague, 'live' | 'upcoming' | 'finished'> =
    status === 'live' ? 'live' : status === 'finished' ? 'finished' : 'upcoming';

  const sorted = useMemo<ActiveLeague[]>(() => {
    const pool = activeLeagueIds
      ? leagues.filter((lg) => activeLeagueIds.has(String(lg.id)))
      : leagues.filter((lg) => (lg[countKey] ?? 0) > 0);
    return [...pool].sort((a, b) => {
      const af = isFavoriteLeague(a.id) ? 1 : 0;
      const bf = isFavoriteLeague(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      const oa = getLeagueSortKey(a.id);
      const ob = getLeagueSortKey(b.id);
      if (oa !== ob) return oa - ob;
      return (b[countKey] ?? 0) - (a[countKey] ?? 0);
    });
  }, [leagues, isFavoriteLeague, countKey, activeLeagueIds]);

  return (
    <View style={{ height: STRIP_HEIGHT, justifyContent: 'center' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 6,
          alignItems: 'center',
        }}
      >
        <Pill
          active={selected === ALL_LEAGUES_ID}
          label={t('allLeagues')}
          onPress={() => onChange(ALL_LEAGUES_ID)}
        />
        {sorted.map((lg) => {
          const id = String(lg.id);
          return (
            <Pill
              key={id}
              active={selected === id}
              label={lg.name}
              flag={LEAGUE_FLAGS[id]}
              favorite={isFavoriteLeague(lg.id)}
              onPress={() => onChange(id)}
              onToggleFavorite={() => toggleLeague(lg.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

function Pill({
  active,
  label,
  flag,
  favorite,
  onPress,
  onToggleFavorite,
}: {
  active: boolean;
  label: string;
  flag?: string;
  favorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
}) {
  const { colors } = useTheme();
  const starColor = active
    ? colors.primaryText
    : favorite
      ? colors.warning
      : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        height: PILL_HEIGHT,
        paddingLeft: onToggleFavorite ? 8 : 12,
        paddingRight: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: active ? colors.primary : colors.surfaceMuted,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      {onToggleFavorite && (
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            paddingHorizontal: 2,
            paddingVertical: 4,
          })}
        >
          <Star
            size={11}
            color={starColor}
            fill={favorite ? starColor : 'transparent'}
            strokeWidth={2}
          />
        </Pressable>
      )}
      {flag && (
        <Text allowFontScaling={false} style={{ fontSize: 13, lineHeight: 15 }}>
          {flag}
        </Text>
      )}
      <Text
        allowFontScaling={false}
        style={{
          color: active ? colors.primaryText : colors.textPrimary,
          fontSize: 12,
          lineHeight: 14,
          fontWeight: '700',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
