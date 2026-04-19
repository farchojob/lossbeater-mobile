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
};

export function LeagueFilterStrip({ selected, onChange, status }: Props) {
  const { t } = useTranslations('matches');
  const { leagues } = useLeagues();
  const { isFavoriteLeague, toggleLeague } = useUserFavorites();

  const countKey: keyof Pick<ActiveLeague, 'live' | 'upcoming' | 'finished'> =
    status === 'live' ? 'live' : status === 'finished' ? 'finished' : 'upcoming';

  const sorted = useMemo<ActiveLeague[]>(() => {
    return [...leagues]
      .filter((lg) => (lg[countKey] ?? 0) > 0)
      .sort((a, b) => {
        const af = isFavoriteLeague(a.id) ? 1 : 0;
        const bf = isFavoriteLeague(b.id) ? 1 : 0;
        if (af !== bf) return bf - af;
        const oa = getLeagueSortKey(a.id);
        const ob = getLeagueSortKey(b.id);
        if (oa !== ob) return oa - ob;
        return (b[countKey] ?? 0) - (a[countKey] ?? 0);
      });
  }, [leagues, isFavoriteLeague, countKey]);

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
              count={lg[countKey] ?? 0}
              favorite={isFavoriteLeague(lg.id)}
              onPress={() => onChange(id)}
              onLongPress={() => toggleLeague(lg.id)}
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
  count,
  favorite,
  onPress,
  onLongPress,
}: {
  active: boolean;
  label: string;
  flag?: string;
  count?: number;
  favorite?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      hitSlop={4}
      style={({ pressed }) => ({
        height: PILL_HEIGHT,
        paddingHorizontal: 12,
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
      {favorite && (
        <Star
          size={11}
          color={active ? colors.primaryText : colors.warning}
          fill={active ? colors.primaryText : colors.warning}
          strokeWidth={2}
        />
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
      {typeof count === 'number' && count > 0 && (
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: 999,
            backgroundColor: active
              ? 'rgba(255,255,255,0.2)'
              : colors.background,
            minWidth: 20,
            alignItems: 'center',
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              color: active ? colors.primaryText : colors.textMuted,
              fontSize: 10,
              lineHeight: 12,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
