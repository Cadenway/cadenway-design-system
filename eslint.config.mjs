import eslint from '@eslint/js';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/',
    '**/coverage/',
    '**/storybook-static/',
    '.angular/',
    'docs/',
    '.claude/',
    '.codex/',
  ]),
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
    ],
    // Inline templates are linted with the same rules as the *.html files below.
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      // Angular components, directives and test hosts are classes that only carry a decorator.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // Angular 22 conventions: `cw-` selectors, signal inputs, outputs and models. No class
      // suffix is required (`Button`, not `ButtonComponent`), so the suffix rules stay off.
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'cw', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'cw', style: 'camelCase' },
      ],
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message: 'Use explicit named exports: a barrel hides what a package exposes.',
        },
      ],
      // The dependency review rejected the packages below: each message names the replacement.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Rejected dependency: use the native fetch.' },
            { name: 'moment', message: 'Rejected dependency: use Temporal or Intl.' },
            { name: 'date-fns', message: 'Rejected dependency: use Temporal or Intl.' },
            { name: 'lodash', message: 'Rejected dependency: use the language built-ins.' },
            { name: 'qrcode', message: 'Rejected dependency: the applications use `qr`.' },
            { name: 'uqr', message: 'Rejected dependency: the applications use `qr`.' },
          ],
          patterns: [
            {
              regex: '\\.\\./cadenway-',
              message: 'Never import sibling sources: use the published @cadenway/* packages.',
            },
            {
              group: ['axios/*', 'moment/*', 'date-fns/*', 'lodash/*', 'qrcode/*', 'uqr/*'],
              message: 'Rejected dependency: see the rule entry of the package itself.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
  {
    files: ['**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
