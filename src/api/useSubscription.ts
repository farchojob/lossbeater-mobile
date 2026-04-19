import { useMemo } from 'react';
import { useMe } from './useMe';

export type Tier = 'free' | 'plus' | 'pro';

const TIER_RANK: Record<Tier, number> = { free: 0, plus: 1, pro: 2 };

export type SubscriptionState = {
  tier: Tier;
  isActive: boolean;
  isLoading: boolean;
  isFree: boolean;
  isPlusOrAbove: boolean;
  isProOrAbove: boolean;
  hasAccess: (required: Tier) => boolean;
  expiresAt: string | null;
};

export function useSubscription(): SubscriptionState {
  const me = useMe();
  return useMemo(() => {
    const rawTier = (me.data?.entitlements?.tier as string | undefined) ?? 'free';
    const tier: Tier = rawTier === 'plus' || rawTier === 'pro' ? rawTier : 'free';
    const isActive = me.data?.entitlements?.active === true;
    const effectiveTier: Tier = isActive ? tier : 'free';
    const rank = TIER_RANK[effectiveTier];
    return {
      tier: effectiveTier,
      isActive,
      isLoading: me.loading,
      isFree: effectiveTier === 'free',
      isPlusOrAbove: rank >= 1,
      isProOrAbove: rank >= 2,
      hasAccess: (required: Tier) => rank >= TIER_RANK[required],
      expiresAt: (me.data?.entitlements?.expiresAt as string | null | undefined) ?? null,
    };
  }, [me.data, me.loading]);
}
