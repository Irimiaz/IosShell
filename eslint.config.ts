import { defineConfig } from 'eslint/config';
import expo from 'eslint-config-expo/flat';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  expo,
  prettier,
  {
    ignores: ['node_modules/', '.expo/', 'dist/'],
  },
]);
