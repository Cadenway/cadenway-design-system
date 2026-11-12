import type { Preview } from '@storybook/angular-vite';

import '../src/styles.css';

/** Annotations applied to every story, in the Storybook UI and in the Vitest run alike. */
const preview: Preview = {
  parameters: {
    // An accessibility violation fails the story test (`pnpm test:storybook`) instead of being a
    // warning in the panel: every brick passes the accessibility checks (CLAUDE.md, TL;DR 4).
    a11y: { test: 'error' },
  },
};

export default preview;
