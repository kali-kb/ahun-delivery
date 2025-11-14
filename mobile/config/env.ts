import Constants from 'expo-constants';

/**
 * Centralized environment configuration
 * Works in both development and production builds
 */
export const ENV = {
  API_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || '',
  MAPBOX_ACCESS_TOKEN: Constants.expoConfig?.extra?.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
};
