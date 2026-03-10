import { useAuth } from '@/lib/AuthContext';

const TIER_RANK = { free: 0, pro_scout: 1, elite: 2 };

const FEATURE_REQUIREMENTS = {
  ai_highlights: 'pro_scout',
  advanced_scouting: 'pro_scout',
  scout_card_pdf: 'pro_scout',
  detailed_who_scouting: 'pro_scout',
  ai_coach: 'pro_scout',
  priority_placement: 'pro_scout',
  unlimited_vault: 'elite',
  priority_recaps: 'elite',
  trend_predictions: 'elite',
};

export default function useSubscriptionTier() {
  const { user } = useAuth();

  const raw = user?.subscription_tier || 'free';
  const expires = user?.subscription_expires_at;
  const isExpired = expires ? new Date(expires) < new Date() : false;
  const tier = isExpired ? 'free' : raw;

  const rank = TIER_RANK[tier] ?? 0;

  return {
    tier,
    isFree: rank === 0,
    isPro: rank >= 1,
    isElite: rank >= 2,
    isExpired,
    expiresAt: expires ? new Date(expires) : null,
    canAccess: (feature) => {
      const required = FEATURE_REQUIREMENTS[feature];
      if (!required) return true;
      return rank >= (TIER_RANK[required] ?? 0);
    },
  };
}
