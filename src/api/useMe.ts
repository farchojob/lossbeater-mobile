import { useApiQuery } from './hooks';
import type { MeResponse } from './types';

/**
 * Consolidated user payload: profile + entitlements + coins + voting stats.
 * Backend: GET /api/v1/me
 */
export function useMe() {
  return useApiQuery<MeResponse>('/me');
}
