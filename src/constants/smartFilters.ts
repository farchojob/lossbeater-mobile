export type SmartFilterId =
  | 'quality_picks'
  | 'value_bets'
  | 'recommended_bets'
  | 'hot_streaks'
  | 'clear_favorites'
  | 'h2h_dominance'
  | 'best_performance';

export type SmartFilterOption = {
  id: SmartFilterId;
  labelKey: string;
  descriptionKey: string;
};

export const SMART_FILTER_OPTIONS: SmartFilterOption[] = [
  {
    id: 'quality_picks',
    labelKey: 'filters.options.qualityPicks.label',
    descriptionKey: 'filters.options.qualityPicks.description',
  },
  {
    id: 'value_bets',
    labelKey: 'filters.options.valueBets.label',
    descriptionKey: 'filters.options.valueBets.description',
  },
  {
    id: 'recommended_bets',
    labelKey: 'filters.options.recommendedBets.label',
    descriptionKey: 'filters.options.recommendedBets.description',
  },
  {
    id: 'hot_streaks',
    labelKey: 'filters.options.hotStreaks.label',
    descriptionKey: 'filters.options.hotStreaks.description',
  },
  {
    id: 'clear_favorites',
    labelKey: 'filters.options.clearFavorites.label',
    descriptionKey: 'filters.options.clearFavorites.description',
  },
  {
    id: 'h2h_dominance',
    labelKey: 'filters.options.h2hDominance.label',
    descriptionKey: 'filters.options.h2hDominance.description',
  },
  {
    id: 'best_performance',
    labelKey: 'filters.options.bestPerformance.label',
    descriptionKey: 'filters.options.bestPerformance.description',
  },
];

export function buildFilterQueryParams(
  active: ReadonlyArray<SmartFilterId>,
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const id of active) params[id] = 'true';
  return params;
}
