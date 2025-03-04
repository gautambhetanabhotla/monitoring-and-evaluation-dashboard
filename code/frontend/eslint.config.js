import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jest from 'eslint-plugin-jest';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jest': jest,
    },
    rules: {
    ...js.configs.recommended.rules,
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    ...reactHooks.configs.recommended.rules,
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
    ],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^React$'
    }],
    'react/prop-types': "off",
    },
  },
  {
    files: ['**/*.test.{js,jsx}'], // Add this block to apply Jest plugin to test files
    plugins: {
      'jest': jest,
    },
    env: {
      'jest/globals': true,
    },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
];
