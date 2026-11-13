import type { StorybookConfig } from '@storybook/angular-vite';

/**
 * Storybook configuration of the design system.
 *
 * Stories are read from this application (tooling stories) and from the packages, next to the
 * bricks they document (`packages/ui/<brick>/<brick>.stories.ts`).
 */
const config: StorybookConfig = {
  framework: {
    name: '@storybook/angular-vite',
    // The framework looks for `.storybook/tsconfig.json` by default; the application has one
    // tsconfig for its configuration, its stories and the stories of the packages.
    options: { tsconfig: './tsconfig.json' },
  },
  stories: [
    '../src/**/*.stories.ts',
    '../../../packages/*/src/**/*.stories.ts',
    // One folder per entry point of @cadenway/ui (`packages/ui/<brick>/`).
    '../../../packages/ui/*/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  // No usage data leaves a developer machine or CI.
  core: { disableTelemetry: true },
};

export default config;
