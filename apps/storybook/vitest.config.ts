import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Runs every story as a browser test (`pnpm test:storybook`): the story renders in headless
 * Chromium, its `play` function is the interaction test and the accessibility addon fails the test
 * on a violation (`parameters.a11y.test` in `.storybook/preview.ts`).
 */
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // Carries the Angular build options to the framework when no `storybook dev` runs.
          storybookAngularVitest(),
          storybookTest({ configDir: '.storybook' }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
