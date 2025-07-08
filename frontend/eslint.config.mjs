import js from '@eslint/js';
import next from 'eslint-plugin-next';

export default [
  js.configs.recommended,
  next.configs.recommended,
  {
    ignores: ['**/node_modules/**'],
  },
];