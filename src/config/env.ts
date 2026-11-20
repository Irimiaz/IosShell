import Constants from 'expo-constants';

// Values come from `extra` in app.config.ts, which reads them from .env.
// Optional values are undefined when they are not set.

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  username: (extra.username as string | undefined) || undefined,
} as const;
