/**
 * Centralised backend config. Override via .env:
 *   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:4000
 */
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.lossbeater.com').replace(/\/+$/, '');

export const API_PREFIX = '/api/v1';

export const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';
