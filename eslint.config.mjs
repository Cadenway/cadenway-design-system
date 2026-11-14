import eslint from '@eslint/js';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import uiDocumentation from './rules/ui-documentation.mjs';
import uiMemberRegions from './rules/ui-member-regions.mjs';
import uiNativeOutputs from './rules/ui-native-outputs.mjs';

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
        [
          { type: 'element', prefix: 'cw', style: 'kebab-case' },
          { type: 'attribute', prefix: 'cw', style: 'camelCase' },
        ],
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
    files: ['packages/ui/**/*.ts'],
    linterOptions: { noInlineConfig: true },
    plugins: {
      jsdoc,
      cadenway: {
        rules: {
          'ui-documentation': uiDocumentation,
          'ui-member-regions': uiMemberRegions,
          'ui-native-outputs': uiNativeOutputs,
        },
      },
    },
    rules: {
      // Explicit annotations are permitted in the UI package, including for literal initializers.
      '@typescript-eslint/no-inferrable-types': 'off',
      // Literal annotations preserve narrow exported types while satisfying explicit typing.
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@angular-eslint/no-input-rename': ['error', { allowedNames: ['disabled', 'pinned'] }],
      '@angular-eslint/no-output-native': 'off',
      'cadenway/ui-native-outputs': 'error',
      'cadenway/ui-documentation': 'error',
      'cadenway/ui-member-regions': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: { FunctionDeclaration: true, ClassDeclaration: true },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
            'TSEnumMember',
            'Program > VariableDeclaration',
            'ExportNamedDeclaration[declaration.type="VariableDeclaration"]',
            'ClassDeclaration > ClassBody > PropertyDefinition',
            'ClassDeclaration > ClassBody > MethodDefinition',
            'ClassDeclaration > ClassBody > TSAbstractPropertyDefinition',
            'ClassDeclaration > ClassBody > TSAbstractMethodDefinition',
            'TSInterfaceBody > TSPropertySignature',
            'TSInterfaceBody > TSMethodSignature',
            'TSTypeAliasDeclaration > TSTypeLiteral > TSPropertySignature',
            'TSTypeAliasDeclaration > TSTypeLiteral > TSMethodSignature',
          ],
        },
      ],
      'jsdoc/require-param': [
        'error',
        {
          checkDestructured: false,
          checkDestructuredRoots: false,
          contexts: [
            'FunctionDeclaration',
            'VariableDeclarator > ArrowFunctionExpression',
            'MethodDefinition > FunctionExpression',
            'TSMethodSignature',
          ],
        },
      ],
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': [
        'error',
        {
          contexts: [
            'FunctionDeclaration',
            'VariableDeclarator > ArrowFunctionExpression',
            'MethodDefinition > FunctionExpression',
            {
              context: 'TSMethodSignature[returnType.typeAnnotation.type!="TSVoidKeyword"]',
              forceRequireReturn: true,
            },
          ],
        },
      ],
      'jsdoc/require-returns-type': 'error',
      'jsdoc/require-returns-description': 'error',
      '@typescript-eslint/typedef': [
        'error',
        {
          variableDeclaration: true,
          memberVariableDeclaration: true,
          arrayDestructuring: true,
          objectDestructuring: true,
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
  {
    files: ['packages/ui/**/*.html'],
    linterOptions: { noInlineConfig: true },
    rules: {
      '@angular-eslint/template/elements-content': [
        'error',
        { allowList: ['cwAvatarAdd', 'cwBubbleReaction'] },
      ],
      '@angular-eslint/template/label-has-associated-control': [
        'error',
        {
          labelComponents: [
            {
              selector: 'label',
              inputs: ['for', 'htmlFor', 'cwFieldLabel', 'cwQuestionnaireChoice'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
