import type { StorybookConfig } from '@storybook/angular-vite';

/**
 * Storybook configuration of the design system.
 *
 * Stories are read from this application (tooling stories) and from the packages, next to the
 * bricks they document (`packages/ui/components/<brick>/<brick>.stories.ts`).
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
    // One folder per brick of @cadenway/ui (`packages/ui/components/<brick>/`).
    '../../../packages/ui/components/*/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  // No usage data leaves a developer machine or CI.
  core: { disableTelemetry: true },
  // Vite discovers these subpath imports only when a story first loads them, then re-optimizes and
  // reloads mid-run: two copies of Angular end up loaded (NG0203 in the story tests). Declaring
  // them up front keeps one optimized bundle for the whole run.
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    optimizeDeps: {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        '@angular/aria/accordion',
        '@angular/aria/combobox',
        '@angular/aria/grid',
        '@angular/aria/listbox',
        '@angular/aria/menu',
        '@angular/aria/tabs',
        '@angular/aria/toolbar',
        '@angular/aria/tree',
        '@angular/cdk/a11y',
        '@angular/cdk/accordion',
        '@angular/cdk/bidi',
        '@angular/cdk/clipboard',
        '@angular/cdk/dialog',
        '@angular/cdk/drag-drop',
        '@angular/cdk/keycodes',
        '@angular/cdk/overlay',
        '@angular/cdk/platform',
        '@angular/cdk/portal',
        '@angular/cdk/scrolling',
        '@angular/cdk/stepper',
        '@angular/forms',
        '@angular/forms/signals',
        '@ng-icons/core',
        '@ng-icons/phosphor-icons/bold',
        '@ng-icons/phosphor-icons/fill',
      ],
    },
    build: {
      ...viteConfig.build,
      // Storybook's preview runtime and axe are each distributed as a single large module.
      // The budget remains below the original 1.68 MB preview chunk after vendor splitting.
      chunkSizeWarningLimit: 850,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'accessibility',
                test: /node_modules[\\/](?:\.pnpm[\\/]axe-core@[^\\/]+[\\/]node_modules[\\/])?axe-core/,
                priority: 30,
              },
              {
                name: 'angular',
                test: /node_modules[\\/]@angular[\\/]/,
                priority: 20,
                maxSize: 300_000,
              },
              {
                name: 'storybook',
                test: /node_modules[\\/](?:@storybook[\\/]|storybook[\\/])/,
                priority: 10,
                maxSize: 300_000,
              },
              { name: 'vendor', test: /node_modules/, maxSize: 300_000 },
            ],
          },
        },
      },
    },
  }),
};

export default config;
