import React from 'react';
import { Text, View } from 'react-native';
import { Crown, Sparkles, Target } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import { useSubscription } from '../../../api/useSubscription';
import { BlurredContent } from '../../subscription/BlurredContent';
import type { AnyMatch } from '../../../api/useMatchById';

type Match = Record<string, unknown> & AnyMatch;

export function PickQualityBadge({ match }: { match: Match }) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const sub = useSubscription();

  const cp = (match.consolidatedPredictions ?? {}) as Record<string, any>;
  const summary = (cp.summary ?? {}) as Record<string, any>;
  const pq = (summary.pickQuality ?? {}) as Record<string, any>;
  const mw = (cp.matchWinner ?? {}) as Record<string, any>;

  const tier = typeof pq.tier === 'string' ? (pq.tier as string) : null;
  const telegramGrade =
    typeof pq.telegram_grade === 'string' ? (pq.telegram_grade as string) : null;
  const recommended = (mw.recommendedBet ?? {}) as Record<string, any>;
  const recoLabel = typeof recommended.label === 'string' ? recommended.label : null;
  const recoSide = typeof recommended.side === 'string' ? recommended.side : null;

  if (!tier && !recoLabel) return null;

  const visual = resolveVisual(tier, colors);

  const body = (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: visual.border,
        backgroundColor: visual.bg,
        padding: 12,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: visual.iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <visual.Icon size={14} color={visual.tint} strokeWidth={2.6} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              color: visual.tint,
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {visual.label(t)}
          </Text>
          {recoSide && (
            <Text
              allowFontScaling={false}
              style={{
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: '800',
                marginTop: 2,
              }}
            >
              {formatRecoSide(recoSide, match)}
            </Text>
          )}
        </View>
        {telegramGrade && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: hexWithAlpha(visual.tint, 0.16),
              borderWidth: 1,
              borderColor: hexWithAlpha(visual.tint, 0.3),
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                color: visual.tint,
                fontSize: 10,
                fontWeight: '800',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {telegramGrade}
            </Text>
          </View>
        )}
      </View>

      {recoLabel && (
        <Text
          allowFontScaling={false}
          style={{
            color: colors.textSecondary,
            fontSize: 11,
            lineHeight: 15,
          }}
        >
          {recoLabel}
        </Text>
      )}
    </View>
  );

  if (sub.isPlusOrAbove) return body;
  return (
    <BlurredContent tier="plus" feature={visual.label(t)} compact>
      {body}
    </BlurredContent>
  );
}

type Visual = {
  Icon: LucideIcon;
  tint: string;
  bg: string;
  border: string;
  iconBg: string;
  label: (t: (k: string) => string) => string;
};

function resolveVisual(tier: string | null, colors: ReturnType<typeof useTheme>['colors']): Visual {
  if (tier === 'confirm') {
    return {
      Icon: Crown,
      tint: colors.success,
      bg: hexWithAlpha(colors.success, 0.08),
      border: hexWithAlpha(colors.success, 0.3),
      iconBg: hexWithAlpha(colors.success, 0.16),
      label: (t) => t('pickQuality.confirmPick'),
    };
  }
  if (tier === 'contradict') {
    return {
      Icon: Target,
      tint: colors.warning,
      bg: hexWithAlpha(colors.warning, 0.08),
      border: hexWithAlpha(colors.warning, 0.3),
      iconBg: hexWithAlpha(colors.warning, 0.16),
      label: (t) => t('pickQuality.contradictPick'),
    };
  }
  if (tier === 'top') {
    return {
      Icon: Crown,
      tint: colors.success,
      bg: hexWithAlpha(colors.success, 0.08),
      border: hexWithAlpha(colors.success, 0.3),
      iconBg: hexWithAlpha(colors.success, 0.16),
      label: (t) => t('pickQuality.topPick'),
    };
  }
  if (tier === 'confident') {
    return {
      Icon: Sparkles,
      tint: colors.primary,
      bg: hexWithAlpha(colors.primary, 0.08),
      border: hexWithAlpha(colors.primary, 0.3),
      iconBg: hexWithAlpha(colors.primary, 0.16),
      label: (t) => t('pickQuality.confidentPick'),
    };
  }
  if (tier === 'value') {
    return {
      Icon: Target,
      tint: colors.warning,
      bg: hexWithAlpha(colors.warning, 0.08),
      border: hexWithAlpha(colors.warning, 0.3),
      iconBg: hexWithAlpha(colors.warning, 0.16),
      label: (t) => t('pickQuality.valueBet'),
    };
  }
  return {
    Icon: Target,
    tint: colors.textMuted,
    bg: colors.surfaceMuted,
    border: colors.border,
    iconBg: colors.surface,
    label: (t) => t('pickQuality.standard'),
  };
}

function formatRecoSide(side: string, match: Match): string {
  const home = (match.home as { name?: string } | undefined)?.name ?? '';
  const away = (match.away as { name?: string } | undefined)?.name ?? '';
  const normalized = side.toLowerCase();
  if (normalized === 'home') return home || 'Home';
  if (normalized === 'away') return away || 'Away';
  return side;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  return `${normalized}${aHex}`;
}
