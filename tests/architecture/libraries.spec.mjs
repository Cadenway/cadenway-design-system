import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { verifyAngularArchitecture } from '@cadenway/angular-testing/architecture';

const rootDir = fileURLToPath(new URL('../..', import.meta.url));

test('UI entry points and test layout respect the library architecture', () => {
  assert.deepEqual(
    verifyAngularArchitecture({
      rootDir,
      tsconfig: 'packages/ui/tsconfig.lib.json',
      profile: 'library',
      roots: ['packages/ui', 'apps/storybook/src'],
      exceptions: [
        {
          file: 'packages/ui/tests/forms-ng-model.spec.ts',
          rule: 'spec-colocation',
          reason: 'The compatibility suite checks the forms integration of multiple UI bricks.',
        },
        {
          file: 'packages/ui/components/markdown/public-api.ts',
          rule: 'private-library-symbol',
          reason: 'Existing private Markdown grammar helpers are shared with the block editor.',
        },
      ],
    }),
    [],
  );
});

test('Icons respect the library architecture', () => {
  assert.deepEqual(
    verifyAngularArchitecture({
      rootDir,
      tsconfig: 'packages/icons/tsconfig.lib.json',
      profile: 'library',
      roots: ['packages/icons'],
    }),
    [],
  );
});
