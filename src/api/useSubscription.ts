import { useMemo } from 'react';
import { useMe } from './useMe';

export type Tier = 'free' | 'plus' | 'pro';

const TIER_RANK: Record<Tier, number> = { free: 0, plus: 1, pro: 2 };

export type SubscriptionState = {
  tier: Tier;
  plan: string;
  status: string | null;
  isActive: boolean;
  isTrial: boolean;
  isLoading: boolean;
  isFree: boolean;
  isPlusOrAbove: boolean;
  isProOrAbove: boolean;
  hasAccess: (required: Tier) => boolean;
  hasFeature: (feature: string) => boolean;
  expiresAt: string | null;
};

export function useSubscription(): SubscriptionState {
  const me = useMe();

  return useMemo(() => {
    const ent = me.data?.entitlements ?? null;

    const rawTier = ent?.tier;
    const rawPlan = ent?.plan ?? 'free';
    let tier: Tier = 'free';
    if (rawTier === 'plus' || rawTier === 'pro') tier = rawTier;
    else if (typeof rawPlan === 'string' && rawPlan.startsWith('premium')) tier = 'plus';

    const status = ent?.status ?? null;
    const isActive = status === 'active' || status === 'trial';
    const isTrial = status === 'trial';

    const rank = TIER_RANK[tier];
    const effectiveRank = isActive ? rank : 0;

    return {
      tier: isActive ? tier : 'free',
      plan: String(rawPlan ?? 'free'),
      status,
      isActive,
      isTrial,
      isLoading: me.loading,
      isFree: !isActive || tier === 'free',
      isPlusOrAbove: effectiveRank >= TIER_RANK.plus,
      isProOrAbove: effectiveRank >= TIER_RANK.pro,
      hasAccess: (required: Tier) => {
        if (!isActive && required !== 'free') return false;
        return rank >= TIER_RANK[required];
      },
      hasFeature: (feature: string) => Boolean(ent?.features?.[feature]),
      expiresAt: (ent?.expiresAt as string | null | undefined) ?? null,
    };
  }, [me.data, me.loading]);
}
