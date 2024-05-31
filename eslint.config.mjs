import eslint from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['jest']: jestPlugin,
      ['unicorn']: unicornPlugin
    }
  },
  {
    ignores: [
      '**/coverage/',
      '**/node_modules/',
      '*.js',
      'dist/',
      'eslint.config.mjs'
    ]
  },

  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      globals: {
        ...globals.es2020,
        ...globals.node
      },

      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    rules: {
      '@typescript-eslint/consistent-indexed-object-style': [
        'error',
        'index-signature'
      ],
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/restrict-template-expressions': 'off',
      'dot-notation': 'off',

      'unicorn/no-typeof-undefined': 'error'
    }
  },
  {
    files: ['**/*.test.ts'],
    ...jestPlugin.configs['flat/recommended'],
    ...jestPlugin.configs['flat/style'],
    plugins: {
      jest: jestPlugin
    },
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error'
    }
  },
  eslintPluginPrettierRecommended
);
