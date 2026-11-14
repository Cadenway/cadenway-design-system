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
