import Constants from 'expo-constants';

// Values come from `extra` in app.config.js, which reads them from .env.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Check your .env file.`,
    );
  }
  return value;
}

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  username: required('username', extra.username),
} as const;
