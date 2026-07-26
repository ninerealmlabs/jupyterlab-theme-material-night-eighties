import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import jupyterPlugin from '@jupyter/eslint-plugin'

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'dist',
      'lib',
      'coverage',
      'scss',
      'jupyterlab_material_night_eighties',
      '**/*.js',
      '**/*.d.ts',
      // Jupyter writes these into src/ when the repo is browsed in JupyterLab;
      // they are not in tsconfig, so the TS parser errors on them.
      '**/.ipynb_checkpoints/**',
      '.venv',
      'tests',
      '**/__tests__',
      'ui-tests',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  jupyterPlugin.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      jupyter: jupyterPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2015,
        ...globals.node,
      },
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'curly': ['error', 'all'],
      'eqeqeq': 'error',
      'prefer-arrow-callback': 'error',
    },
  },
  prettierRecommended,
])
