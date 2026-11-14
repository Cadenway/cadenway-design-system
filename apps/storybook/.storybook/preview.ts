import type { Decorator, Preview } from '@storybook/angular-vite';

import '../src/styles.css';

/**
 * Renders every brick story twice, in a light and a dark `data-theme` scope side by side, so each
 * state is reviewed and tested in both themes (.claude/rules/stories.md). A story that lays out the
 * themes itself (the foundations) opts out with `parameters: { themes: false }`. Play functions
 * scope their queries to one theme: `within(themeScope(canvasElement, 'light'))`.
 */
const inBothThemes: Decorator = (storyFn, context) => {
  const story = storyFn();
  if (context.parameters['themes'] === false || story.template === undefined) return story;
  // `@for` gives each copy its own template scope: template references (`#list`) and the bindings
  // that read them stay inside their theme.
  return {
    ...story,
    template: `
      <div class="grid gap-4 lg:grid-cols-2">
        @for (cwTheme of ['light', 'dark']; track cwTheme) {
          <section [attr.data-theme]="cwTheme" [attr.aria-label]="cwTheme === 'light' ? 'Thème clair' : 'Thème sombre'"
                   class="flex min-w-0 flex-col items-start gap-4 rounded-xl bg-background p-6 text-foreground">
            ${story.template ?? ''}
          </section>
        }
      </div>`,
  };
};

/**
 * Annotations applied to every story, in the Storybook UI and in the Vitest run alike.
 * Axe retains every violation and incomplete result while limiting successful nodes in reports.
 */
const preview: Preview = {
  decorators: [inBothThemes],
  parameters: {
    // An accessibility violation fails the story test (`pnpm test:storybook`) instead of being a
    // warning in the panel: every brick passes the accessibility checks (CLAUDE.md, TL;DR 4).
    a11y: { test: 'error', options: { resultTypes: ['violations', 'incomplete'] } },
  },
};

export default preview;
